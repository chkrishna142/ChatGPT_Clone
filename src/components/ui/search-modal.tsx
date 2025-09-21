"use client";

import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { Chat } from "@/types";
import { useEffect, useRef, useState } from "react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  currentChatId?: string;
  onSelectChat: (chatId: string) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  chats,
  currentChatId,
  onSelectChat,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter chats based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  const handleChatSelect = (chatId: string) => {
    onSelectChat(chatId);
    onClose();
    setSearchQuery("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md max-h-[80vh] flex flex-col"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Search Chats</h2>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search chats by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Chat List */}
        <div className=" overflow-y-auto h-[300px] ">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery.trim() ? (
                <>
                  <p className="text-sm">No chats found matching</p>
                  <p className="text-sm font-medium">"{searchQuery}"</p>
                </>
              ) : (
                <p className="text-sm">No chats available</p>
              )}
            </div>
          ) : (
            <div className="p-2">
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors hover:bg-gray-50",
                    currentChatId === chat.id
                      ? "bg-blue-50 border border-blue-200"
                      : "border border-transparent"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          currentChatId === chat.id
                            ? "text-blue-900"
                            : "text-gray-900"
                        )}
                      >
                        {chat.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {chat.messages?.length || 0} messages
                      </p>
                    </div>
                    {currentChatId === chat.id && (
                      <div className="ml-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {filteredChats.length} chat{filteredChats.length !== 1 ? "s" : ""}
              {searchQuery.trim() && ` matching "${searchQuery}"`}
            </span>
            <span>Press Esc to close</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
