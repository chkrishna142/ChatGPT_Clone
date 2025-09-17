import connectDB from "@/config/database";
import { ChatModel } from "@/lib/models";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId") || "default";

    const chats = await ChatModel.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    return new Response(JSON.stringify(chats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Get chats error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch chats",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { id, title, messages, userId = "default" } = await req.json();

    const chat = new ChatModel({
      id,
      title,
      messages,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await chat.save();

    return new Response(JSON.stringify(chat), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Create chat error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to create chat",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const { id, title, messages, userId = "default" } = await req.json();

    const chat = await ChatModel.findOneAndUpdate(
      { id, userId },
      {
        title,
        messages,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    return new Response(JSON.stringify(chat), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Update chat error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to update chat",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const chatId = url.searchParams.get("id");
    const userId = url.searchParams.get("userId") || "default";

    if (!chatId) {
      return new Response(JSON.stringify({ error: "Chat ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await ChatModel.findOneAndDelete({ id: chatId, userId });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Delete chat error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to delete chat",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
