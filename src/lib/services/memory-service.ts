import { getMem0Client, memoryConfig } from "@/config/mem0";
import { Message } from "@/types";

export interface MemoryItem {
  id: string;
  content: string;
  category: string;
  metadata: {
    timestamp: string;
    chatId?: string;
    messageId?: string;
    confidence?: number;
    importance?: number;
  };
}

export interface MemorySearchResult {
  memories: MemoryItem[];
  relevantContext: string;
}

export class MemoryService {
  private userId: string;

  constructor(userId: string = memoryConfig.user_id) {
    this.userId = userId;
  }

  /**
   * Add a new memory from a conversation
   */
  async addMemory(
    content: string,
    category: string = memoryConfig.categories.CONTEXT,
    metadata: Record<string, any> = {}
  ): Promise<string | null> {
    try {
      // Validate content before sending to mem0
      if (!content || content.trim().length === 0) {
        return null;
      }

      // Try different API formats for mem0 with type assertions
      let response: any;
      try {
        // Try the object-based API first
        const client = getMem0Client() as any;
        response = await client.add({
          messages: [{ role: "user", content: content.trim() }],
          user_id: this.userId,
          metadata: {
            category,
            timestamp: new Date().toISOString(),
            ...metadata,
          },
        });
      } catch (err) {
        // Fallback to simpler API
        try {
          const client = getMem0Client() as any;
          response = await client.add(content.trim(), this.userId);
        } catch (err2) {
          return null;
        }
      }

      return response?.id || response?.memory_id || null;
    } catch (error) {
      console.error("Error adding memory:", error);
      return null;
    }
  }

  /**
   * Search for relevant memories based on query
   */
  async searchMemories(
    query: string,
    limit: number = 5
  ): Promise<MemorySearchResult> {
    try {
      // Add error handling for mem0 API issues
      if (!query || query.trim().length === 0) {
        return { memories: [], relevantContext: "" };
      }

      // Try different API formats for mem0 with type assertions
      let response: any;
      try {
        // Try the object-based API first
        const client = getMem0Client() as any;
        response = await client.search({
          query: query.trim(),
          user_id: this.userId,
          limit,
        });
      } catch (err) {
        // Fallback to simpler API
        try {
          const client = getMem0Client() as any;
          response = await client.search(query.trim(), this.userId);
        } catch (err2) {
          return { memories: [], relevantContext: "" };
        }
      }

      const memoriesArray = response?.memories || response || [];
      const memories: MemoryItem[] =
        memoriesArray?.map((memory: any) => ({
          id: memory.id,
          content: memory.content || memory.text,
          category: memory.metadata?.category || "general",
          metadata: {
            timestamp: memory.metadata?.timestamp || memory.created_at,
            chatId: memory.metadata?.chatId,
            messageId: memory.metadata?.messageId,
            confidence: memory.score,
            importance: memory.metadata?.importance || 1,
          },
        })) || [];

      // Create relevant context summary
      const relevantContext = memories
        .slice(0, 3) // Top 3 most relevant
        .map((m) => m.content)
        .join("\n");

      return {
        memories,
        relevantContext,
      };
    } catch (error) {
      console.error("Error searching memories:", error);
      // Return empty result instead of failing
      return { memories: [], relevantContext: "" };
    }
  }

  /**
   * Extract and store important information from a conversation
   */
  async processConversation(
    messages: Message[],
    chatId: string
  ): Promise<void> {
    try {
      // Process the last few messages for new information
      const recentMessages = messages.slice(-5);

      for (const message of recentMessages) {
        if (message.role === "user") {
          // Extract user preferences, facts, and context
          await this.extractAndStoreUserInfo(message, chatId);
        }
      }

      // Store conversation summary if it's a significant interaction
      if (messages.length > 0) {
        await this.storeConversationSummary(messages, chatId);
      }
    } catch (error) {
      console.error("Error processing conversation:", error);
    }
  }

  /**
   * Extract user information from messages
   */
  private async extractAndStoreUserInfo(
    message: Message,
    chatId: string
  ): Promise<void> {
    const content = message.content.toLowerCase();

    // Check for preferences
    if (
      content.includes("i prefer") ||
      content.includes("i like") ||
      content.includes("i love")
    ) {
      await this.addMemory(
        message.content,
        memoryConfig.categories.PREFERENCES,
        { chatId, messageId: message.id, importance: 3 }
      );
    }

    // Check for personal facts
    if (
      content.includes("i am") ||
      content.includes("my name is") ||
      content.includes("i work")
    ) {
      await this.addMemory(message.content, memoryConfig.categories.FACTS, {
        chatId,
        messageId: message.id,
        importance: 4,
      });
    }

    // Check for skills/interests
    if (
      content.includes("i know") ||
      content.includes("i study") ||
      content.includes("interested in")
    ) {
      await this.addMemory(message.content, memoryConfig.categories.SKILLS, {
        chatId,
        messageId: message.id,
        importance: 3,
      });
    }
  }

  /**
   * Store conversation summary for context
   */
  private async storeConversationSummary(
    messages: Message[],
    chatId: string
  ): Promise<void> {
    if (messages.length < 3) return; // Too short to summarize

    const lastMessages = messages.slice(-3);
    const summary = lastMessages
      .map((m) => `${m.role}: ${m.content.substring(0, 100)}`)
      .join(" | ");

    await this.addMemory(
      `Conversation summary: ${summary}`,
      memoryConfig.categories.HISTORY,
      { chatId, importance: 2 }
    );
  }

  /**
   * Get all memories for a user
   */
  async getAllMemories(): Promise<MemoryItem[]> {
    try {
      // Try different API formats for mem0 with type assertions
      let response: any;
      try {
        // Try the object-based API first
        const client = getMem0Client() as any;
        response = await client.getAll({ user_id: this.userId });
      } catch (err) {
        // Fallback to simpler API
        try {
          const client = getMem0Client() as any;
          response = await client.getAll(this.userId);
        } catch (err2) {
          return [];
        }
      }

      const memoriesArray = response?.memories || response || [];
      return (
        memoriesArray?.map((memory: any) => ({
          id: memory.id,
          content: memory.content || memory.text,
          category: memory.metadata?.category || "general",
          metadata: {
            timestamp: memory.metadata?.timestamp || memory.created_at,
            chatId: memory.metadata?.chatId,
            messageId: memory.metadata?.messageId,
            confidence: memory.score,
            importance: memory.metadata?.importance || 1,
          },
        })) || []
      );
    } catch (error) {
      console.error("Error getting all memories:", error);
      return [];
    }
  }

  /**
   * Delete a specific memory
   */
  async deleteMemory(memoryId: string): Promise<boolean> {
    try {
      // Try different API formats for mem0 with type assertions
      try {
        const client = getMem0Client() as any;
        await client.delete({ memory_id: memoryId });
      } catch (err) {
        // Fallback to simpler API
        try {
          const client = getMem0Client() as any;
          await client.delete(memoryId);
        } catch (err2) {
          throw err2;
        }
      }
      return true;
    } catch (error) {
      console.error("Error deleting memory:", error);
      return false;
    }
  }

  /**
   * Update a memory
   */
  async updateMemory(memoryId: string, newContent: string): Promise<boolean> {
    try {
      // Try different API formats for mem0 with type assertions
      try {
        const client = getMem0Client() as any;
        await client.update({
          memory_id: memoryId,
          text: newContent,
        });
      } catch (err) {
        // Fallback to simpler API
        try {
          const client = getMem0Client() as any;
          await client.update(memoryId, { text: newContent });
        } catch (err2) {
          throw err2;
        }
      }
      return true;
    } catch (error) {
      console.error("Error updating memory:", error);
      return false;
    }
  }

  /**
   * Get personalized context for AI responses
   */
  async getPersonalizedContext(query: string): Promise<string> {
    const searchResult = await this.searchMemories(query, 3);

    if (searchResult.memories.length === 0) {
      return "";
    }

    const contextParts = [
      "Based on what I know about you:",
      searchResult.relevantContext,
    ];

    return contextParts.join("\n");
  }
}

// Export singleton instance for backward compatibility
export const memoryService = new MemoryService();
