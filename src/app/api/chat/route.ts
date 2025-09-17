import { trimMessagesForContext } from "@/lib/utils";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages, model = "gpt-4o-mini" } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 });
    }

    // Validate API key
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === "your_openai_api_key"
    ) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured",
          details: "Please add a valid OPENAI_API_KEY to your .env.local file",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Trim messages for context window (GPT-4o-mini supports 128k tokens)
    const trimmedMessages = trimMessagesForContext(messages, 16000);

    // Convert our message format to Vercel AI SDK format
    const formattedMessages = trimmedMessages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Use Vercel AI SDK streamText
    const result = await streamText({
      model: openai(model),
      messages: formattedMessages,
      system: `You are Galaxy Chat, an AI assistant similar to ChatGPT. You are helpful, harmless, and honest. 
      You can assist with a wide variety of tasks including answering questions, helping with analysis, 
      writing, coding, math, and creative tasks. Be conversational and engaging while being accurate and helpful.`,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);

    // Handle specific OpenAI errors
    if (error?.status === 429) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API quota exceeded",
          details:
            "Please add credits to your OpenAI account at https://platform.openai.com/account/billing",
          action: "Add payment method and credits to continue",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error?.status === 401) {
      return new Response(
        JSON.stringify({
          error: "Invalid OpenAI API key",
          details: "Please check your OPENAI_API_KEY in .env.local",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
