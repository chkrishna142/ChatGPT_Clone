"use client";

import { Message } from "@/components/message";
import { use, useEffect, useState } from "react";

interface SharedMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

interface SharedChatData {
  title: string;
  messages: SharedMessage[];
  createdAt: string;
}

export default function SharedChatPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const resolvedParams = use(params);
  const [chatData, setChatData] = useState<SharedChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedChat = async () => {
      try {
        const response = await fetch(
          `/api/share?shareId=${resolvedParams.shareId}`
        );

        if (response.ok) {
          const data = await response.json();
          setChatData(data);
        } else {
          setError("Shared chat not found or no longer available");
        }
      } catch (err) {
        setError("Failed to load shared chat");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedChat();
  }, [resolvedParams.shareId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading shared chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Chat not found
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Galaxy Chat
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {chatData?.title}
              </h1>
              <p className="text-sm text-gray-500">Shared chat • View only</p>
            </div>
            <a
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Try Galaxy Chat
            </a>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto py-6 px-4">
            {chatData?.messages.map((message) => (
              <Message
                key={message.id}
                message={{
                  ...message,
                  timestamp: new Date(message.timestamp),
                }}
                onEdit={() => {}}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              This is a shared conversation from Galaxy Chat
            </p>
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Create your own AI conversations →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
