"use client";

import { ChatInterface } from "@/components/chat-interface";
import { Sidebar } from "@/components/sidebar";
import { useChat } from "@/lib/hooks/use-chat";
import { useEffect } from "react";

export default function Page() {
  const {
    chats,
    currentChatId,
    messages,
    isLoading,
    isLoadingChats,
    createNewChat,
    selectChat,
    deleteChat,
    sendMessage,
    editMessage,
  } = useChat();

  // Create initial chat if none exists and not loading
  useEffect(() => {
    if (!isLoadingChats && chats.length === 0) {
      createNewChat();
    }
  }, [isLoadingChats, chats.length, createNewChat]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
      />
      <div className="flex-1">
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onEditMessage={editMessage}
        />
      </div>
    </div>
  );
}
