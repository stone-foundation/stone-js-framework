import { NotFoundError } from '@stone-js/http-core';
/**
 * In-memory task store — the pure domain logic, identical to the declarative variant's service.
 *
 * Here it carries NO decorator: the imperative API registers it explicitly with
 * `defineService(TaskService, { alias: 'tasks', isClass: true, singleton: true })` in
 * Application.ts. The class stays a plain, directly-unit-testable object (no mocks).
 */
export class TaskService {
    tasks = [{ id: 1, title: 'Try Stone.js', done: false }];
    sequence = 1;
    /**
     * @returns All tasks.
     */
    list() {
        return this.tasks;
    }
    /**
     * @param id - The task id.
     * @returns The task.
     * @throws {NotFoundError} When the task does not exist.
     */
    find(id) {
        const task = this.tasks.find((t) => t.id === id);
        if (task === undefined) {
            throw new NotFoundError(`Task #${id} not found.`);
        }
        return task;
    }
    /**
     * @param title - The task title.
     * @returns The created task.
     */
    create(title) {
        const task = { id: ++this.sequence, title, done: false };
        this.tasks.push(task);
        return task;
    }
    /**
     * Toggles a task's done flag.
     *
     * @param id - The task id.
     * @returns The updated task.
     */
    toggle(id) {
        const task = this.find(id);
        task.done = !task.done;
        return task;
    }
    /**
     * Removes a task (idempotent).
     *
     * @param id - The task id.
     */
    remove(id) {
        this.tasks = this.tasks.filter((t) => t.id !== id);
    }
}
