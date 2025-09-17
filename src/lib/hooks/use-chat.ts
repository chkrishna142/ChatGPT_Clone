"use client";

import { generateId } from "@/lib/utils";
import { Chat, Message } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  // Load chats from MongoDB on mount
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setIsLoadingChats(true);
      const response = await fetch("/api/chats");

      if (response.ok) {
        const savedChats = await response.json();
        setChats(savedChats);

        // Set current chat to the most recent one if none selected
        if (!currentChatId && savedChats.length > 0) {
          setCurrentChatId(savedChats[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const saveChat = async (chat: Chat) => {
    try {
      const response = await fetch("/api/chats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chat),
      });

      if (!response.ok) {
        console.error("Failed to save chat:", await response.text());
      }
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };

  const deleteChatFromDB = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats?id=${chatId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to delete chat:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Create a new chat
  const createNewChat = useCallback(async () => {
    const newChat: Chat = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);

    // Save to MongoDB
    await saveChat(newChat);

    return newChat.id;
  }, []);

  // Select a chat
  const selectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
  }, []);

  // Delete a chat
  const deleteChat = useCallback(
    async (chatId: string) => {
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(undefined);
      }

      // Delete from MongoDB
      await deleteChatFromDB(chatId);
    },
    [currentChatId]
  );

  // Send a message
  const sendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      if (!content.trim() && (!attachments || attachments.length === 0)) return;

      let chatId = currentChatId;

      // Create new chat if none exists
      if (!chatId) {
        chatId = await createNewChat();
      }

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date(),
        attachments: attachments?.map((file) => ({
          id: generateId(),
          type: file.type.startsWith("image/") ? "image" : "document",
          url: URL.createObjectURL(file), // Temporary URL for preview
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        })),
      };

      // Add user message to chat
      const updatedChat = chats.find((c) => c.id === chatId);
      if (updatedChat) {
        const newChat = {
          ...updatedChat,
          messages: [...updatedChat.messages, userMessage],
          title:
            updatedChat.messages.length === 0
              ? content.length > 50
                ? content.substring(0, 50) + "..."
                : content
              : updatedChat.title,
          updatedAt: new Date(),
        };

        setChats((prev) =>
          prev.map((chat) => (chat.id === chatId ? newChat : chat))
        );

        // Save to MongoDB
        await saveChat(newChat);
      }

      setIsLoading(true);

      try {
        // Get messages for context
        const chat = chats.find((c) => c.id === chatId);
        const messages = [...(chat?.messages || []), userMessage].map(
          (msg) => ({
            role: msg.role,
            content: msg.content,
          })
        );

        // Call the AI API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        let assistantMessageContent = "";
        const assistantMessageId = generateId();

        // Add empty assistant message that we'll update
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      id: assistantMessageId,
                      role: "assistant" as const,
                      content: "",
                      timestamp: new Date(),
                    },
                  ],
                  updatedAt: new Date(),
                }
              : chat
          )
        );

        // Read the stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          assistantMessageContent += chunk;

          // Update the assistant message with new content
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    messages: chat.messages.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: assistantMessageContent }
                        : msg
                    ),
                    updatedAt: new Date(),
                  }
                : chat
            )
          );
        }
      } catch (error) {
        console.error("Error sending message:", error);
        // Add error message
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      id: generateId(),
                      role: "assistant" as const,
                      content:
                        "Sorry, I encountered an error. Please try again.",
                      timestamp: new Date(),
                    },
                  ],
                  updatedAt: new Date(),
                }
              : chat
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentChatId, chats, createNewChat]
  );

  // Edit a message and regenerate response
  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!currentChatId) return;

      const chat = chats.find((c) => c.id === currentChatId);
      if (!chat) return;

      const messageIndex = chat.messages.findIndex(
        (msg) => msg.id === messageId
      );
      if (messageIndex === -1) return;

      // Update the edited message
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id === messageId ? { ...msg, content: newContent } : msg
                ),
                updatedAt: new Date(),
              }
            : chat
        )
      );

      // If it's a user message, regenerate all subsequent assistant messages
      const editedMessage = chat.messages[messageIndex];
      if (editedMessage.role === "user") {
        // Remove all messages after the edited message
        const updatedMessages = chat.messages.slice(0, messageIndex + 1);
        updatedMessages[messageIndex] = {
          ...editedMessage,
          content: newContent,
        };

        // Update chat with truncated messages
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: updatedMessages, updatedAt: new Date() }
              : chat
          )
        );

        // Regenerate assistant response
        setIsLoading(true);

        try {
          const messages = updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages }),
          });

          if (!response.ok) {
            throw new Error("Failed to regenerate response");
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error("No response body");

          let assistantMessageContent = "";
          const assistantMessageId = generateId();

          // Add empty assistant message
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === currentChatId
                ? {
                    ...chat,
                    messages: [
                      ...chat.messages,
                      {
                        id: assistantMessageId,
                        role: "assistant" as const,
                        content: "",
                        timestamp: new Date(),
                      },
                    ],
                    updatedAt: new Date(),
                  }
                : chat
            )
          );

          // Stream the response
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            assistantMessageContent += chunk;

            setChats((prev) =>
              prev.map((chat) =>
                chat.id === currentChatId
                  ? {
                      ...chat,
                      messages: chat.messages.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: assistantMessageContent }
                          : msg
                      ),
                      updatedAt: new Date(),
                    }
                  : chat
              )
            );
          }
        } catch (error) {
          console.error("Error regenerating response:", error);
          // Add error message
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === currentChatId
                ? {
                    ...chat,
                    messages: [
                      ...chat.messages,
                      {
                        id: generateId(),
                        role: "assistant" as const,
                        content:
                          "Sorry, I encountered an error while regenerating the response. Please try again.",
                        timestamp: new Date(),
                      },
                    ],
                    updatedAt: new Date(),
                  }
                : chat
            )
          );
        } finally {
          setIsLoading(false);
        }
      }
    },
    [currentChatId, chats]
  );

  return {
    chats,
    currentChatId,
    currentChat,
    messages: currentChat?.messages || [],
    isLoading,
    isLoadingChats,
    createNewChat,
    selectChat,
    deleteChat,
    sendMessage,
    editMessage,
  };
}
