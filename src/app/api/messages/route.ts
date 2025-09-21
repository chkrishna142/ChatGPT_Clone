import connectDB from "@/config/database";
import { Chat } from "@/lib/models";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await connectDB();

    const { chatId, messageId, liked, disliked } = await req.json();

    if (!chatId || !messageId) {
      return new Response(
        JSON.stringify({ error: "Chat ID and Message ID are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Find the chat and update the specific message
    const chat = await Chat.findOneAndUpdate(
      {
        id: chatId,
        userId,
        "messages.id": messageId,
      },
      {
        $set: {
          "messages.$.liked": liked,
          "messages.$.disliked": disliked,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!chat) {
      return new Response(
        JSON.stringify({ error: "Chat or message not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Update message error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to update message",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
