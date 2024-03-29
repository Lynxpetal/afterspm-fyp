import { formsPrompt } from "@/app/helpers/constants/chatbot-prompts"
import { MessageArraySchema } from "@/app/lib/validators/message"
import { ChatGPTMessage, OpenAIStreamPayload, OpenAIStream } from "@/app/lib/validators/openai-stream"



export async function POST(req: Request) {
    const { messages } = await req.json()

    const parsedMessages = MessageArraySchema.parse(messages) 

    const outboundMessages: ChatGPTMessage[] = parsedMessages.map((message) => {
        return {
            role: message.isUserMessage ? "user" : "assistant",
            content: message.text,
        }
    })

    const payload: OpenAIStreamPayload = {
        model: "gpt-4",
        messages: outboundMessages,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 3000,
        stream: true,
        n: 1
    }

    const stream = await OpenAIStream(payload)

    return new Response(stream)
}