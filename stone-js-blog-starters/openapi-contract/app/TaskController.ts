import { NewTask, NewTaskInput } from './schemas'
import { validate } from '@stone-js/validation'
import { EventHandler, Get, Post } from '@stone-js/router'
import { Task, TaskService } from './TaskService'
import { IncomingHttpEvent, JsonHttpResponse } from '@stone-js/http-core'

export interface TaskControllerOptions {
  taskService: TaskService
}

/**
 * TaskController
 *
 * The real API the contract describes. `validate({ body: NewTask })` enforces the exact schema the
 * OpenAPI document advertises, so `POST /tasks` genuinely returns 201 on a match and 422 otherwise.
 */
@EventHandler('/tasks')
export class TaskController {
  private readonly taskService: TaskService

  constructor ({ taskService }: TaskControllerOptions) {
    this.taskService = taskService
  }

  @Get('/')
  @JsonHttpResponse(200)
  list (): Task[] {
    return this.taskService.all()
  }

  @Post('/', { middleware: [validate({ body: NewTask })] })
  @JsonHttpResponse(201)
  create (event: IncomingHttpEvent): Task {
    return this.taskService.add(event.get<NewTaskInput>('body') as NewTaskInput)
  }
}
