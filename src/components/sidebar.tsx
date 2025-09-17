"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, MessageSquare, Plus, Settings, X } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  chats: any[];
  currentChatId?: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function Sidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-gray-900 text-white transition-all duration-300",
        isCollapsed ? "w-12" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        {!isCollapsed && <h2 className="text-lg font-semibold">Galaxy Chat</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          {isCollapsed ? <Menu size={18} /> : <X size={18} />}
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
          variant="outline"
        >
          <Plus size={16} className="mr-2" />
          {!isCollapsed && "New chat"}
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-3">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={cn(
              "flex items-center p-2 rounded-lg cursor-pointer transition-colors group hover:bg-gray-800",
              currentChatId === chat.id ? "bg-gray-800" : ""
            )}
            onClick={() => onSelectChat(chat.id)}
          >
            <MessageSquare
              size={16}
              className="mr-3 flex-shrink-0 text-gray-400"
            />
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm text-gray-200 truncate">{chat.title}</p>
                <p className="text-xs text-gray-400">
                  {new Date(chat.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Settings */}
      {!isCollapsed && (
        <div className="p-3 border-t border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Settings size={16} className="mr-3" />
            Settings
          </Button>
        </div>
      )}
    </div>
  );
}
