import mongoose, { Document, Schema } from "mongoose";

// Simplified interfaces for MongoDB
interface IAttachment {
  id?: string;
  type: "image" | "document";
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  publicId?: string; // For Cloudinary files
  uuid?: string; // For Uploadcare files
  source?: "cloudinary" | "uploadcare"; // Track the source
}

interface IMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isEditing?: boolean;
  attachments?: IAttachment[];
  liked?: boolean;
  disliked?: boolean;
}

interface IChat extends Document {
  id: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

interface ISharedChat extends Document {
  shareId: string;
  chatId: string;
  userId: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
}

// Attachment Schema
const AttachmentSchema = new Schema({
  id: { type: String },
  type: { type: String, enum: ["image", "document"], required: true },
  url: { type: String, required: true },
  filename: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  publicId: { type: String }, // For Cloudinary files
  uuid: { type: String }, // For Uploadcare files
  source: { type: String, enum: ["cloudinary", "uploadcare"] }, // Track the source
});

// Message Schema
const MessageSchema = new Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isEditing: { type: Boolean, default: false },
  attachments: [AttachmentSchema],
  liked: { type: Boolean, default: false },
  disliked: { type: Boolean, default: false },
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

// Shared Chat Schema
const SharedChatSchema = new Schema<ISharedChat>({
  shareId: { type: String, required: true, unique: true },
  chatId: { type: String, required: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
});

// Export models
export const Chat =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);

export const SharedChat =
  mongoose.models.SharedChat ||
  mongoose.model<ISharedChat>("SharedChat", SharedChatSchema);
