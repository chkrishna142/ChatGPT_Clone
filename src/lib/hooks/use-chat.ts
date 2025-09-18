"use client";

import { generateId } from "@/lib/utils";
import { Chat, Message, UploadedFile } from "@/types";
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
    async (content: string, attachments?: UploadedFile[]) => {
      if (!content.trim() && (!attachments || attachments.length === 0)) {
        return;
      }

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
          url: file.url, // Use Cloudinary URL from uploaded file
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        })),
      };

      // Use functional update to get current state and build new chat
      let chatWithUserMessage: Chat | undefined;

      setChats((prevChats) => {
        const currentChat = prevChats.find((c) => c.id === chatId);
        if (!currentChat) {
          console.error("Chat not found:", chatId);
          return prevChats;
        }

        chatWithUserMessage = {
          ...currentChat,
          messages: [...currentChat.messages, userMessage],
          title:
            currentChat.messages.length === 0
              ? content.length > 50
                ? content.substring(0, 50) + "..."
                : content
              : currentChat.title,
          updatedAt: new Date(),
        };

        return prevChats.map((chat) =>
          chat.id === chatId ? chatWithUserMessage! : chat
        );
      });

      if (!chatWithUserMessage) {
        console.error("Failed to create chat with user message");
        return;
      }

      setIsLoading(true);

      try {
        // Use the chat with user message we just created
        const messages = chatWithUserMessage.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Call the AI API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(
            `Failed to get response: ${response.status} ${errorText}`
          );
        }

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

        // Check if response is streaming or plain text
        const contentType = response.headers.get("content-type");
        const isStreaming = !contentType?.includes("text/plain");

        if (isStreaming) {
          // Handle streaming response (OpenAI)
          const reader = response.body?.getReader();
          if (!reader) throw new Error("No response body");

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
        } else {
          // Handle non-streaming response (Hugging Face)
          assistantMessageContent = await response.text();

          // Update the assistant message with the complete response
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

        // Save the complete chat to database
        const finalChat: Chat = {
          ...chatWithUserMessage,
          messages: [
            ...chatWithUserMessage.messages,
            {
              id: assistantMessageId,
              role: "assistant" as const,
              content: assistantMessageContent,
              timestamp: new Date(),
            },
          ],
          updatedAt: new Date(),
        };

        await saveChat(finalChat);
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessageId = generateId();
        const errorMessage = {
          id: errorMessageId,
          role: "assistant" as const,
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };

        // Add error message to UI
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, errorMessage],
                  updatedAt: new Date(),
                }
              : chat
          )
        );

        // Build chat with error message for database save
        const chatWithError: Chat = {
          ...chatWithUserMessage,
          messages: [...chatWithUserMessage.messages, errorMessage],
          updatedAt: new Date(),
        };

        // Save chat with error message to database
        saveChat(chatWithError).catch(console.error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentChatId, createNewChat]
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

          // Save the complete chat with the regenerated assistant response to database
          const currentChat = chats.find((c) => c.id === currentChatId);
          if (currentChat) {
            const finalChat = {
              ...currentChat,
              messages: [
                ...updatedMessages,
                {
                  id: assistantMessageId,
                  role: "assistant" as const,
                  content: assistantMessageContent,
                  timestamp: new Date(),
                },
              ],
              updatedAt: new Date(),
            };
            // Save to database without waiting to avoid blocking UI
            saveChat(finalChat).catch(console.error);
          }
        } catch (error) {
          console.error("Error regenerating response:", error);
          const errorMessageId = generateId();
          const errorMessage = {
            id: errorMessageId,
            role: "assistant" as const,
            content:
              "Sorry, I encountered an error while regenerating the response. Please try again.",
            timestamp: new Date(),
          };

          // Add error message to UI
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === currentChatId
                ? {
                    ...chat,
                    messages: [...chat.messages, errorMessage],
                    updatedAt: new Date(),
                  }
                : chat
            )
          );

          // Save error message to database
          const currentChat = chats.find((c) => c.id === currentChatId);
          if (currentChat) {
            const chatWithError = {
              ...currentChat,
              messages: [...updatedMessages, errorMessage],
              updatedAt: new Date(),
            };
            saveChat(chatWithError).catch(console.error);
          }
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
