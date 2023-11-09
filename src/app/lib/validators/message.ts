import { string, z } from 'zod'

export const MessageSchema = z.object({
  id: z.string(),
  text: z.string(),
  isUserMessage: z.boolean(),
})

export const MessageArraySchema = z.array(MessageSchema)
export type Message = z.infer<typeof MessageSchema>

export const QuestionSchema = z.object({
  label: z.string(),
  question: z.array(string()),
  category: z.string(),
  answer: z.number()
})

export const QuestionArraySchema = z.array(QuestionSchema)
export type Question = z.infer<typeof QuestionSchema>