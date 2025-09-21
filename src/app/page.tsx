"use client";

import { ChatInterface } from "@/components/chat-interface";
import { ClientOnly } from "@/components/client-only";
import { Sidebar } from "@/components/sidebar";
import { useChat } from "@/lib/hooks/use-chat";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Page() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    chats,
    currentChatId,
    messages,
    isLoading,
    isLoadingChats,
    createNewChat,
    selectChat,
    deleteChat,
    renameChat,
    sendMessage,
    editMessage,
    likeMessage,
    dislikeMessage,
  } = useChat();

  // Create initial chat if none exists and not loading
  useEffect(() => {
    if (!isLoadingChats && chats.length === 0 && isSignedIn) {
      createNewChat();
    }
  }, [isLoadingChats, chats.length, createNewChat, isSignedIn]);

  // Show loading spinner while Clerk loads or chats are loading
  if (!isLoaded || (isSignedIn && isLoadingChats)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading ChatGPT...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="max-w-md text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">ChatGPT</h1>
            <p className="text-gray-600">
              Your personalized AI assistant with memory
            </p>
          </div>
          <div className="space-y-4">
            <SignInButton mode="modal">
              <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Sign In to Continue
              </button>
            </SignInButton>
            <p className="text-sm text-gray-500">
              Sign in to access your personalized conversations and memory
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-100">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading ChatGPT...</p>
          </div>
        </div>
      }
    >
      <div className="flex h-screen bg-gray-100 relative overflow-hidden">
        <Sidebar
          chats={chats || []}
          currentChatId={currentChatId}
          onNewChat={createNewChat}
          onSelectChat={(chatId, hideSidebar) => {
            selectChat(chatId);
            if (hideSidebar && window.innerWidth < 768) {
              setSidebarCollapsed(true);
            }
          }}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
          user={user}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
        />

        {/* Mobile Overlay */}
        {!sidebarCollapsed && (
          <div
            className="fixed inset-0 bg-transparent bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatInterface
            messages={messages || []}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            onEditMessage={editMessage}
            onLikeMessage={likeMessage}
            onDislikeMessage={dislikeMessage}
            currentChatId={currentChatId}
            currentChatTitle={chats.find((c) => c.id === currentChatId)?.title}
            onDeleteChat={deleteChat}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      </div>
    </ClientOnly>
  );
}
