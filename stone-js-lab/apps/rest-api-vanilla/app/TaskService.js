import { Service } from '@stone-js/core';
import { NotFoundError } from '@stone-js/http-core';
/**
 * In-memory task store — the pure domain logic. `@Service` only registers it in the container
 * (as `tasks`, singleton); it adds no method wrapping, so `new TaskService()` is still directly
 * unit-testable with real assertions (no mocks). The controller is a thin adapter over it.
 */
@Service({ alias: 'tasks', singleton: true })
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
