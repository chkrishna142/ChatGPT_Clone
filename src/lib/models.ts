import mongoose, { Document, Schema } from "mongoose";

// Simplified interfaces for MongoDB
interface IAttachment {
  id: string;
  type: "image" | "document";
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

interface IMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isEditing?: boolean;
  attachments?: IAttachment[];
}

interface IChat extends Document {
  id: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

// Attachment Schema
const AttachmentSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ["image", "document"], required: true },
  url: { type: String, required: true },
  filename: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
});

// Message Schema
const MessageSchema = new Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isEditing: { type: Boolean, default: false },
  attachments: [AttachmentSchema],
});

// Chat Schema
const ChatSchema = new Schema<IChat>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  userId: { type: String },
});

// Update the updatedAt field before saving
ChatSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Export models
export const ChatModel =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
