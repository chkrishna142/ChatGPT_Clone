"use client";

import { ChatInterface } from "@/components/chat-interface";
import { Sidebar } from "@/components/sidebar";
import { useChat } from "@/lib/hooks/use-chat";
import { SignInButton, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function Page() {
  const { isSignedIn, isLoaded, user } = useUser();
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
    if (!isLoadingChats && chats.length === 0 && isSignedIn) {
      createNewChat();
    }
  }, [isLoadingChats, chats.length, createNewChat, isSignedIn]);

  // Show loading spinner while Clerk loads
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading Galaxy Chat...</p>
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
            <h1 className="text-4xl font-bold text-gray-900">Galaxy Chat</h1>
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
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        user={user}
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
