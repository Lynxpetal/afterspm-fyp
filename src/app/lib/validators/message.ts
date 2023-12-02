import { number, string, z } from 'zod'

export const MessageSchema = z.object({
  id: z.string(),
  text: z.string(),
  isUserMessage: z.string(),
})

export const MessageArraySchema = z.array(MessageSchema)
export type Message = z.infer<typeof MessageSchema>

export const QuestionSchema = z.object({
  label: z.string(),
  options: z.array(z.number()),
  answer: z.number(),
  category: z.string(),
})

export const QuestionArraySchema = z.array(QuestionSchema)
export type Question = z.infer<typeof QuestionSchema>
