import { createOpenAI } from "@ai-sdk/openai";
import { HfInference } from "@huggingface/inference";
import { streamText } from "ai";
import { NextRequest } from "next/server";

import { trimMessagesForContext } from "@/lib/utils";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const hf = new HfInference(process.env.HF_API_KEY);

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return new Response("Messages are required", { status: 400 });
  }

  // Trim messages
  const trimmedMessages = trimMessagesForContext(messages, 4000);

  const provider = process.env.AI_PROVIDER || "openai";

  if (provider === "openai") {
    // Use OpenAI
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages: trimmedMessages,
      temperature: 0.7,
    });
    return result.toTextStreamResponse();
  } else {
    // Use Hugging Face
    const response = await hf.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: trimmedMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return new Response(response.choices[0].message.content, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
