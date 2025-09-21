import connectDB from "@/config/database";
import { Chat, SharedChat } from "@/lib/models";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Generate a random share ID
function generateShareId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await req.json();
    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the chat and verify ownership
    const chat = await Chat.findOne({ id: chatId, userId });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Check if a share already exists for this chat
    let sharedChat = await SharedChat.findOne({ chatId, userId });

    if (!sharedChat) {
      // Create a new shared chat
      const shareId = generateShareId();

      // Only share messages that are not system messages or contain sensitive data
      const publicMessages = chat.messages.filter(
        (msg: any) => msg.role !== "system" && msg.content.trim().length > 0
      ).map((msg: any) => ({
        ...msg,
        attachments: msg.attachments?.map((attachment: any) => ({
          ...attachment,
          size: attachment.size || 0 // Ensure size field exists, default to 0
        }))
      }));

      sharedChat = new SharedChat({
        shareId,
        chatId,
        userId,
        title: chat.title,
        messages: publicMessages,
        createdAt: new Date(),
      });

      await sharedChat.save();
    }

    return NextResponse.json({
      shareId: sharedChat.shareId,
      title: sharedChat.title,
    });
  } catch (error) {
    console.error("Error creating share link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get shared chat by share ID (for public access)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const shareId = url.searchParams.get("shareId");

    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const sharedChat = await SharedChat.findOne({ shareId });
    if (!sharedChat) {
      return NextResponse.json(
        { error: "Shared chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      title: sharedChat.title,
      messages: sharedChat.messages,
      createdAt: sharedChat.createdAt,
    });
  } catch (error) {
    console.error("Error fetching shared chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
