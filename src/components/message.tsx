"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatTimestamp } from "@/lib/utils";
import { Message } from "@/types";
import { Bot, Check, Copy, Edit3, User, X } from "lucide-react";
import { useState } from "react";

interface MessageProps {
  message: Message;
  onEdit: (messageId: string, newContent: string) => void;
}

export function MessageComponent({ message, onEdit }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    onEdit(message.id, editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "group relative mb-6 flex gap-4 px-4 py-6 rounded-lg transition-colors",
        isUser ? "bg-gray-50" : "bg-white hover:bg-gray-50"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
          isUser ? "bg-blue-600" : "bg-green-600"
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900">
              {isUser ? "You" : "Galaxy Chat"}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>

          {/* Actions */}
          {showActions && !isEditing && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-8 w-8 text-gray-400 hover:text-gray-600"
              >
                <Copy size={14} />
              </Button>
              {isUser && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEdit}
                  className="h-8 w-8 text-gray-400 hover:text-gray-600"
                >
                  <Edit3 size={14} />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Message Content */}
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[100px] resize-none"
              autoFocus
            />
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={
                  !editContent.trim() || editContent === message.content
                }
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check size={14} className="mr-1" />
                Save & Submit
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X size={14} className="mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {message.content}
            </div>
          </div>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.attachments.map((attachment, index) => (
              <div
                key={attachment.id || `attachment-${index}`}
                className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg"
              >
                {attachment.type === "image" ? (
                  <div className="flex flex-col space-y-2">
                    <img
                      src={attachment.url}
                      alt={attachment.filename}
                      className="max-w-sm max-h-48 rounded object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(attachment.url, "_blank")}
                    />
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">
                          {attachment.filename}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({(attachment.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      {attachment.source && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                          {attachment.source === "cloudinary"
                            ? "☁️ Cloudinary"
                            : "📁 Uploadcare"}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-medium">
                        {attachment.filename.split(".").pop()?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p
                          className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                          onClick={() => window.open(attachment.url, "_blank")}
                        >
                          {attachment.filename}
                        </p>
                        {attachment.source && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                            {attachment.source === "cloudinary" ? "☁️" : "📁"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { MessageComponent as Message };
