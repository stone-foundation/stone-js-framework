import { EventHandler, Get, Post } from '@stone-js/router'
import { Task, TaskService } from './TaskService'
import { IncomingHttpEvent, JsonHttpResponse } from '@stone-js/http-core'

export interface TaskControllerOptions {
  taskService: TaskService
}

/**
 * TaskController
 *
 * Ordinary router handlers. Over HTTP they are `GET /tasks` and `POST /tasks`; under the MCP
 * adapter the same two methods are listed to an agent as callable tools. You write them once.
 */
@EventHandler('/tasks')
export class TaskController {
  private readonly taskService: TaskService

  constructor ({ taskService }: TaskControllerOptions) {
    this.taskService = taskService
  }

  /** List every task. */
  @Get('/')
  @JsonHttpResponse(200)
  list (): Task[] {
    return this.taskService.all()
  }

  /** Add a task. */
  @Post('/')
  @JsonHttpResponse(201)
  create (event: IncomingHttpEvent): Task {
    return this.taskService.add(event.get<string>('title', 'Untitled'))
  }
}
