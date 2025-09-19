import { createOpenAI } from "@ai-sdk/openai";
import { auth } from "@clerk/nextjs/server";
import { HfInference } from "@huggingface/inference";
import { streamText } from "ai";
import { NextRequest } from "next/server";

import { MemoryService } from "@/lib/services/memory-service";
import { trimMessagesForContext } from "@/lib/utils";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const hf = new HfInference(process.env.HF_API_KEY);

export async function POST(req: NextRequest) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, chatId } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return new Response("Messages are required", { status: 400 });
  }

  try {
    // Create user-specific memory service
    const memoryService = new MemoryService(clerkUserId);
    // Get the latest user message for memory search
    const latestUserMessage = messages
      .slice()
      .reverse()
      .find((m) => m.role === "user");

    // Search for relevant memories if we have a user message
    let personalizedContext = "";
    if (latestUserMessage) {
      const memoryResult = await memoryService.searchMemories(
        latestUserMessage.content
      );
      if (memoryResult.relevantContext) {
        personalizedContext = `\n\nPersonal context: ${memoryResult.relevantContext}`;
      }
    }

    // Trim messages and add personalized context to system message
    const trimmedMessages = trimMessagesForContext(messages, 4000);

    // Add personalized context to the conversation
    let finalMessages = [...trimmedMessages];
    if (personalizedContext) {
      // If there's a system message, append to it; otherwise create one
      const systemMessageIndex = finalMessages.findIndex(
        (m) => m.role === "system"
      );
      if (systemMessageIndex >= 0) {
        finalMessages[systemMessageIndex] = {
          ...finalMessages[systemMessageIndex],
          content:
            finalMessages[systemMessageIndex].content + personalizedContext,
        };
      } else {
        finalMessages.unshift({
          role: "system",
          content: `You are a helpful AI assistant. Remember and use personal context when relevant.${personalizedContext}`,
        });
      }
    }

    const provider = process.env.AI_PROVIDER || "openai";

    if (provider === "openai") {
      // Use OpenAI
      const result = await streamText({
        model: openai("gpt-4o-mini"),
        messages: finalMessages,
        temperature: 0.7,
      });
      return result.toTextStreamResponse();
    } else {
      // Use Hugging Face
      const response = await hf.chatCompletion({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: finalMessages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const responseContent = response.choices[0].message.content;

      // Store the conversation in memory for future context (async, don't wait)
      if (chatId && messages.length > 0) {
        memoryService
          .processConversation(messages, chatId)
          .catch(console.error);
      }

      return new Response(responseContent, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }
}
