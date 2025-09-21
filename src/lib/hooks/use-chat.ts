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

  // Load current chat ID from localStorage on mount
  useEffect(() => {
    const savedChatId = localStorage.getItem("chatgpt-current-id");
    if (savedChatId) {
      setCurrentChatId(savedChatId);
    }
  }, []);

  // Save current chat ID to localStorage whenever it changes
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem("chatgpt-current-id", currentChatId);
    }
  }, [currentChatId]);

  const loadChats = async () => {
    try {
      setIsLoadingChats(true);
      const response = await fetch("/api/chats");

      if (response.ok) {
        const savedChats = await response.json();
        setChats(savedChats);

        // Get saved chat ID from localStorage
        const savedChatId = localStorage.getItem("chatgpt-current-id");

        // Only set current chat if:
        // 1. No current chat ID is set AND
        // 2. Either no saved chat ID exists OR the saved chat ID is not found in the loaded chats
        if (!currentChatId) {
          if (
            savedChatId &&
            savedChats.some((chat: Chat) => chat.id === savedChatId)
          ) {
            // Use the saved chat ID if it exists in the loaded chats
            setCurrentChatId(savedChatId);
          } else if (savedChats.length > 0) {
            // Fallback to the first chat if saved chat doesn't exist
            setCurrentChatId(savedChats[0].id);
          }
        }
      }
    } catch (error) {
      // Failed to load chats
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
        // Failed to save chat
      }
    } catch (error) {
      // Error saving chat
    }
  };

  const deleteChatFromDB = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats?id=${chatId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Failed to delete chat
      }
    } catch (error) {
      // Error deleting chat
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
      setChats((prev) => {
        const remainingChats = prev.filter((chat) => chat.id !== chatId);

        // If we're deleting the currently active chat, auto-select the first remaining chat
        if (currentChatId === chatId && remainingChats.length > 0) {
          setCurrentChatId(remainingChats[0].id);
        } else if (currentChatId === chatId) {
          // If no chats remain, clear the current chat ID
          setCurrentChatId(undefined);
        }

        return remainingChats;
      });

      // Delete from MongoDB
      await deleteChatFromDB(chatId);
    },
    [currentChatId]
  );

  // Rename a chat
  const renameChat = useCallback(
    async (chatId: string, newTitle: string) => {
      try {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? { ...chat, title: newTitle, updatedAt: new Date() }
              : chat
          )
        );

        // Save to MongoDB
        const chat = chats.find((c) => c.id === chatId);
        if (chat) {
          const updatedChat = {
            ...chat,
            title: newTitle,
            updatedAt: new Date(),
          };
          await saveChat(updatedChat);
        }
      } catch (error) {
        console.error("Error renaming chat:", error);
      }
    },
    [chats]
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
          id: file.publicId || file.uuid || generateId(),
          type: file.type.startsWith("image/") ? "image" : "document",
          url: file.url, // Use URL from uploaded file (Cloudinary or Uploadcare)
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          publicId: file.publicId, // For Cloudinary files
          uuid: file.uuid, // For Uploadcare files
          source: file.source, // Track the source
        })),
      };

      // Use functional update to get current state and build new chat
      let chatWithUserMessage: Chat | undefined;

      setChats((prevChats) => {
        const currentChat = prevChats.find((c) => c.id === chatId);
        if (!currentChat) {
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
        return;
      }

      setIsLoading(true);

      try {
        // Use the chat with user message we just created
        const messages = chatWithUserMessage.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Call the AI API with chatId for memory context
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages,
            chatId: chatId,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
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
        saveChat(chatWithError).catch(() => {});
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
            body: JSON.stringify({
              messages,
              chatId: currentChatId,
            }),
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

  // Like a message
  const likeMessage = useCallback(
    (messageId: string, liked: boolean) => {
      if (!currentChatId) return;

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id === messageId
                    ? { ...msg, liked, disliked: liked ? false : msg.disliked }
                    : msg
                ),
                updatedAt: new Date(),
              }
            : chat
        )
      );

      // Save to database (async, don't wait)
      saveChat(chats.find((c) => c.id === currentChatId)!).catch(console.error);
    },
    [currentChatId, chats, saveChat]
  );

  // Dislike a message
  const dislikeMessage = useCallback(
    (messageId: string, disliked: boolean) => {
      if (!currentChatId) return;

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id === messageId
                    ? { ...msg, disliked, liked: disliked ? false : msg.liked }
                    : msg
                ),
                updatedAt: new Date(),
              }
            : chat
        )
      );

      // Save to database (async, don't wait)
      saveChat(chats.find((c) => c.id === currentChatId)!).catch(console.error);
    },
    [currentChatId, chats, saveChat]
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
    renameChat,
    sendMessage,
    editMessage,
    likeMessage,
    dislikeMessage,
  };
}
