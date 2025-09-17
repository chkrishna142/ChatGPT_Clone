export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
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
  createdAt: Date;
  updatedAt: Date;
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

export interface StreamingResponse {
  content: string;
  isComplete: boolean;
  error?: string;
}
