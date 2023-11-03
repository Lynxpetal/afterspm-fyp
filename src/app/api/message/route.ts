import { defaultPrompt } from "@/app/helpers/constants/chatbot-prompts"
import { MessageArraySchema } from "@/app/lib/validators/message"
import { ChatGPTMessage, OpenAIStream, OpenAIStreamPayload } from "@/app/lib/validators/openai-stream"



export async function POST(req: Request) {
    const { messages } = await req.json()

    const parsedMessages = MessageArraySchema.parse(messages)

    const outboundMessages: ChatGPTMessage[] = parsedMessages.map((message) => {
        return {
            role: message.isUserMessage ? "user" : "system",
            content: message.text,
        }
    })

    outboundMessages.unshift({
        role: 'system',
        content: defaultPrompt
    })

    const payload: OpenAIStreamPayload = {
        model: "gpt-3.5-turbo",
        messages: outboundMessages,
        temperature: 0.4,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 150,
        stream: true,
        n: 1
    }

    const stream = await OpenAIStream(payload)

    return new Response(stream)
}

function OpenAIStream(payload: { model: string; messages: ChatGPTMessage[]; temperature: number; top_p: number; frequency_penalty: number; presence_penalty: number; max_tokens: number; stream: boolean; n: number }) {
    throw new Error("Function not implemented.")
}
