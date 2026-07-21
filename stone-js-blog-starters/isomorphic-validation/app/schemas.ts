import { z } from 'zod'

/**
 * The single source of truth for what a task is.
 *
 * A plain value: the API enforces it at the boundary (see TaskController) and the frontend form
 * validates against this exact object, so the two can never disagree.
 */
export const NewTask = z.object({
  title: z.string().min(1).max(120),
  done: z.boolean().optional()
})

export type NewTaskInput = z.infer<typeof NewTask>
