import { z } from 'zod'

/**
 * The single source of truth for a task. The same value validates the request at the boundary
 * (via @stone-js/validation) AND feeds the OpenAPI document, so the published contract can never
 * drift from what the API actually accepts.
 */
export const NewTask = z.object({
  title: z.string().min(1).max(120),
  done: z.boolean().optional()
})

export type NewTaskInput = z.infer<typeof NewTask>
