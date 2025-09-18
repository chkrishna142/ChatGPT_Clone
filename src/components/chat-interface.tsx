"use client";

import { MessageComponent } from "@/components/message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Message, UploadedFile } from "@/types";
import { FileText, Image, MessageSquare, Paperclip, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, attachments?: UploadedFile[]) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
}

export function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  onEditMessage,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || attachments.length > 0) {
      onSendMessage(input.trim(), attachments);
      setInput("");
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Upload files to Cloudinary
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setAttachments((prev) => [
            ...prev,
            {
              ...file,
              url: result.url, // Use Cloudinary URL
              publicId: result.publicId,
            } as UploadedFile,
          ]);
        } else {
          console.error("Upload failed:", await response.text());
        }
      } catch (error) {
        console.error("Upload error:", error);
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              How can I help you today?
            </h2>
            <p className="text-gray-600 max-w-md">
              Start a conversation by typing a message below. You can also
              upload images and documents.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <MessageComponent
                key={message.id}
                message={message}
                onEdit={onEditMessage}
              />
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500 py-4">
                <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                <span>Thinking...</span>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-100 rounded-lg px-3 py-2 text-sm"
                >
                  {file.type.startsWith("image/") ? (
                    <Image size={16} className="mr-2 text-blue-500" />
                  ) : (
                    <FileText size={16} className="mr-2 text-gray-500" />
                  )}
                  <span className="truncate max-w-32">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Galaxy Chat..."
                  className="min-h-[52px] max-h-[200px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-12"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip size={18} />
                </Button>
              </div>
              <Button
                type="submit"
                disabled={
                  (!input.trim() && attachments.length === 0) || isLoading
                }
                className={cn(
                  "h-[52px] px-4 bg-blue-600 hover:bg-blue-700 text-white",
                  (!input.trim() && attachments.length === 0) || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                )}
              >
                <Send size={18} />
              </Button>
            </div>
          </form>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
