import { MemoryService } from "@/lib/services/memory-service";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const memoryService = new MemoryService(userId);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const limit = searchParams.get("limit");
    const action = searchParams.get("action");

    if (action === "all") {
      // Get all memories
      const memories = await memoryService.getAllMemories();
      return NextResponse.json({ memories });
    } else if (query) {
      // Search memories
      const result = await memoryService.searchMemories(
        query,
        limit ? parseInt(limit) : 5
      );
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: "Query parameter or action=all is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch memories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const memoryService = new MemoryService(userId);
    const { content, category, metadata } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const memoryId = await memoryService.addMemory(content, category, metadata);
    return NextResponse.json({ memoryId });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add memory" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const memoryService = new MemoryService(userId);
    const { searchParams } = new URL(request.url);
    const memoryId = searchParams.get("id");

    if (!memoryId) {
      return NextResponse.json(
        { error: "Memory ID is required" },
        { status: 400 }
      );
    }

    const success = await memoryService.deleteMemory(memoryId);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete memory" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const memoryService = new MemoryService(userId);
    const { memoryId, content } = await request.json();

    if (!memoryId || !content) {
      return NextResponse.json(
        { error: "Memory ID and content are required" },
        { status: 400 }
      );
    }

    const success = await memoryService.updateMemory(memoryId, content);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update memory" },
      { status: 500 }
    );
  }
}
