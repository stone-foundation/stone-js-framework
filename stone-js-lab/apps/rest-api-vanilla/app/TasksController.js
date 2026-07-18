import { Delete, EventHandler, Get, Post } from '@stone-js/router';
import { JsonHttpResponse } from '@stone-js/http-core';
/**
 * Tasks REST controller — a thin routing adapter over {@link TaskService}.
 *
 * `@EventHandler('/tasks')` groups the routes; each method is a route. It exercises: GET
 * collection, GET one with a regex path param, POST with a parsed JSON body, a toggle, and a
 * DELETE returning 204.
 *
 * The domain logic lives in TaskService (unit-tested); routing/dispatch is integration-tested.
 * Route params are raw strings in 0.8.0 (no implicit numeric coercion), so ids are parsed with
 * `Number(...)`.
 */
@EventHandler('/tasks', { name: 'tasks' })
export class TasksController {
    logger;
    tasks;
    /**
     * @param dependencies - Auto-wired services.
     */
    constructor({ logger, tasks }) {
        this.logger = logger;
        this.tasks = tasks;
    }
    /**
     * List all tasks.
     */
    @Get('/', { name: 'list' })
    @JsonHttpResponse(200)
    list() {
        return this.tasks.list();
    }
    /**
     * Show a single task by numeric id.
     */
    @Get('/:id(\\d+)', { name: 'show' })
    @JsonHttpResponse(200)
    show(event) {
        return this.tasks.find(Number(event.get('id', '0')));
    }
    /**
     * Create a task from the JSON body.
     */
    @Post('/', { name: 'create' })
    @JsonHttpResponse(201)
    create(event) {
        const task = this.tasks.create(event.get('title', 'Untitled'));
        this.logger.info(`Created task #${task.id}`);
        return task;
    }
    /**
     * Toggle a task's done flag.
     */
    @Post('/:id(\\d+)/toggle', { name: 'toggle' })
    @JsonHttpResponse(200)
    toggle(event) {
        return this.tasks.toggle(Number(event.get('id', '0')));
    }
    /**
     * Delete a task.
     */
    @Delete('/:id(\\d+)', { name: 'remove' })
    @JsonHttpResponse(204)
    remove(event) {
        this.tasks.remove(Number(event.get('id', '0')));
    }
}
