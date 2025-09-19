export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date | string; // Can be Date object or string from API
  isEditing?: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: "image" | "document";
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date | string; // Can be Date object or string from API
  updatedAt: Date | string; // Can be Date object or string from API
  userId?: string;
}

export interface ChatContextWindow {
  maxTokens: number;
  currentTokens: number;
  messages: Message[];
}

export interface FileUploadResponse {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export interface UploadedFile extends File {
  url: string;
  publicId: string;
}

export interface StreamingResponse {
  content: string;
  isComplete: boolean;
  error?: string;
}

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

export interface ChatWithMemory extends Chat {
  relevantMemories?: MemoryItem[];
  personalizedContext?: string;
}
