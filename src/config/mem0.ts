import { MemoryClient } from "mem0ai";

// Initialize mem0 client (server-side only)
let mem0ClientInstance: MemoryClient | null = null;

export const getMem0Client = (): MemoryClient => {
  if (!mem0ClientInstance) {
    const apiKey = process.env.MEM0_API_KEY;
    if (!apiKey) {
      throw new Error(
        "MEM0_API_KEY is required but not found in environment variables"
      );
    }
    mem0ClientInstance = new MemoryClient({
      apiKey: apiKey,
    });
  }
  return mem0ClientInstance;
};

// Memory configuration
export const memoryConfig = {
  // Define different memory types for your chat application
  user_id: "galaxy-chat-user", // You can make this dynamic per user later

  // Memory categories
  categories: {
    PREFERENCES: "user_preferences",
    CONTEXT: "conversation_context",
    FACTS: "user_facts",
    TOPICS: "discussion_topics",
    SKILLS: "user_skills_interests",
    HISTORY: "interaction_history",
  },

  // Memory retention settings
  retention: {
    short_term_days: 7, // Working memory for current context
    medium_term_days: 30, // Recent important information
    long_term_days: 365, // Persistent user knowledge
  },
};

export default getMem0Client;
