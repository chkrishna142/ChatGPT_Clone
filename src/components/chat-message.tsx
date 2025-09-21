"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Attachment, Message } from "@/types";
import Tooltip from "@mui/material/Tooltip";
import { Copy, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaRegStopCircle } from "react-icons/fa";
import { GoPencil } from "react-icons/go";
import { IoCheckmarkOutline } from "react-icons/io5";
import { LiaThumbsDown, LiaThumbsUp } from "react-icons/lia";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
  onEdit: (messageId: string, newContent: string) => void;
  onLike?: (messageId: string, liked: boolean) => void;
  onDislike?: (messageId: string, disliked: boolean) => void;
  chatId?: string;
  attachments?: Attachment[];
}

export function ChatMessage({
  message,
  onEdit,
  onLike,
  onDislike,
  chatId,
  attachments,
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isCopied, setIsCopied] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";

      // Get the scroll height (content height)
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 150;
      const minHeight = 40;

      // Set the height based on content, respecting min/max bounds
      if (scrollHeight <= minHeight) {
        textarea.style.height = `${minHeight}px`;
        textarea.style.overflowY = "hidden";
      } else if (scrollHeight >= maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = "hidden";
      }
    }
  };

  // Adjust height when editing starts or content changes
  useEffect(() => {
    if (isEditing) {
      adjustTextareaHeight();
    }
  }, [isEditing, editContent]);

  const handleSave = () => {
    onEdit(message.id, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const handleLike = async () => {
    if (!chatId || !onLike) return;

    try {
      const newLikedState = !message.liked;
      onLike(message.id, newLikedState);

      // Update in database
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          messageId: message.id,
          liked: newLikedState,
          disliked: newLikedState ? false : message.disliked, // Clear dislike if liking
        }),
      });
    } catch (error) {
      console.error("Failed to update like:", error);
    }
  };

  const handleDislike = async () => {
    if (!chatId || !onDislike) return;

    try {
      const newDislikedState = !message.disliked;
      onDislike(message.id, newDislikedState);

      // Update in database
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          messageId: message.id,
          disliked: newDislikedState,
          liked: newDislikedState ? false : message.liked, // Clear like if disliking
        }),
      });
    } catch (error) {
      console.error("Failed to update dislike:", error);
    }
  };

  const handleReadAloud = () => {
    if (isReading) {
      // Stop reading
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      // Start reading
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(message.content);
        utterance.onstart = () => setIsReading(true);
        utterance.onend = () => setIsReading(false);
        utterance.onerror = () => setIsReading(false);
        window.speechSynthesis.speak(utterance);
      } else {
        console.error("Speech synthesis not supported");
      }
    }
  };
  console.log({ "in chat message 111": attachments });
  if (message.role === "user") {
    return (
      <div className="group w-full text-gray-800 ">
        <div className="flex flex-col gap-2 justify-end items-end p-2 text-base  md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl md:py-6 lg:px-0 m-auto ">
          <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-215px)]  p-4 rounded-xl bg-[#e9e9e980] ">
            <div className="flex flex-grow flex-col gap-3 ">
              {/* attachments */}
              {/* Attachments */}
              {attachments && attachments.length > 0 && (
                <div className="mt-3 space-y-2 px-2 sm:px-4 pb-4">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className={`p-2 bg-gray-100 rounded-lg ${
                        attachment.type === "image"
                          ? "block"
                          : "flex items-center space-x-2"
                      }`}
                    >
                      {attachment.type === "image" ? (
                        <div className="flex flex-col space-y-2">
                          <img
                            src={attachment.url}
                            alt={attachment.filename}
                            className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-48 sm:max-h-56 md:max-h-64 rounded object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              // Opening image
                              window.open(attachment.url, "_blank");
                            }}
                          />
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="truncate">
                              {attachment.filename}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 w-full">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 text-xs font-medium">
                              {(() => {
                                const extension = attachment.filename
                                  ?.split(".")
                                  .pop()
                                  ?.toUpperCase();
                                return extension || "FILE";
                              })()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-700 hover:underline block truncate"
                              title="View or download this file"
                              onClick={(e) => {
                                // Log the URL being opened for debugging
                                // Opening file
                              }}
                            >
                              {attachment.filename}
                            </a>
                            <p className="text-xs text-gray-500">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isEditing ? (
                <div className=" rounded-xl p-0 flex flex-col gap-3 w-full  ">
                  <Textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => {
                      setEditContent(e.target.value);
                      setTimeout(adjustTextareaHeight, 0);
                    }}
                    className="min-h-[40px] h-auto max-h-[150px] border-none bg-transparent shadow-none px-0 py-0 text-base text-gray-800 focus:border-none focus-visible:border-none focus:ring-0 focus-visible:ring-0"
                    style={{
                      minHeight: "40px",
                      maxHeight: "150px",
                      height: "auto",
                    }}
                    autoFocus
                  />

                  <div className="flex items-center justify-end gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      className="rounded-full px-4 py-1 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-100"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="rounded-full px-4 py-1 text-sm font-medium bg-black text-white hover:bg-gray-900"
                      disabled={!editContent.trim()}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap break-words">
                  <div className="markdown prose w-full break-words">
                    {message.content}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-row gap-2  px-2 group-hover:opacity-100 opacity-0 transition-opacity">
            <Tooltip title={isCopied ? "Copied!" : "Copy"}>
              <button
                onClick={handleCopy}
                className="flex  gap-2 rounded-md p-1 hover:bg-[#e8e8e8] hover:text-gray-700  "
              >
                {isCopied ? (
                  <IoCheckmarkOutline size={16} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </Tooltip>
            <Tooltip title="Edit">
              <button
                onClick={handleEdit}
                className="flex ml-auto gap-2 rounded-md p-1 hover:bg-[#e8e8e8] hover:text-gray-700"
              >
                <GoPencil size={16} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group w-full text-gray-800 ">
      <div className="flex p-4 gap-4 text-base md:gap-6 md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl md:py-6 lg:px-0 m-auto border-b border-gray-300">
        <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-6   ">
          <div className="flex flex-grow flex-col gap-3 ">
            <div className="min-h-[20px] flex flex-col items-start gap-4 whitespace-pre-wrap break-words">
              <div className=" prose w-full break-words prose-p:leading-relaxed">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc ml-4 mb-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal ml-4 mb-2">{children}</ol>
                    ),
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    code: ({ children }) => (
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto mb-2">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
          <div className=" flex flex-row gap-0.5  px-1">
            <Tooltip title={isCopied ? "Copied!" : "Copy"}>
              <button
                onClick={handleCopy}
                className="flex  gap-2 rounded-md p-1 hover:bg-[#e8e8e8] hover:text-gray-700  "
              >
                {isCopied ? (
                  <IoCheckmarkOutline size={16} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </Tooltip>
            {message.liked || message.disliked ? (
              <>
                {message.liked && (
                  <Tooltip title={message.liked ? "Unlike" : "Like"}>
                    <button
                      onClick={handleLike}
                      className={`flex gap-2 rounded-md p-1 hover:bg-[#e8e8e8] hover:text-gray-700  ${
                        message.liked ? "text-gray-900 bg-gray-200" : ""
                      }`}
                    >
                      <LiaThumbsUp size={18} color="#71717a" />
                    </button>
                  </Tooltip>
                )}
                {message.disliked && (
                  <Tooltip
                    title={message.disliked ? "Remove dislike" : "Dislike"}
                  >
                    <button
                      onClick={handleDislike}
                      className={`flex gap-2 rounded-md p-1 hover:bg-[#e8e8e8] hover:text-gray-700   ${
                        message.disliked ? "text-gray-900 bg-gray-200" : ""
                      }`}
                    >
                      <LiaThumbsDown size={18} />
                    </button>
                  </Tooltip>
                )}
              </>
            ) : (
              <>
                {" "}
                <Tooltip title={message.liked ? "Unlike" : "Like"}>
                  <button
                    onClick={handleLike}
                    className={`flex gap-2 rounded-md p-1 hover:bg-[#e8e8e8] hover:text-gray-700  `}
                  >
                    <LiaThumbsUp size={18} />
                  </button>
                </Tooltip>
                <Tooltip
                  title={message.disliked ? "Remove dislike" : "Dislike"}
                >
                  <button
                    onClick={handleDislike}
                    className={`flex gap-2 rounded-md p-1 hover:bg-[#e8e8e8] hover:text-gray-700   `}
                  >
                    <LiaThumbsDown size={18} />
                  </button>
                </Tooltip>
              </>
            )}

            {isReading ? (
              <Tooltip title={"Stop reading"}>
                <button
                  onClick={handleReadAloud}
                  className={`flex gap-2 rounded-md p-1 hover:bg-[#e8e8e8] hover:text-gray-700 bg-gray-200`}
                >
                  <FaRegStopCircle size={16} />
                </button>
              </Tooltip>
            ) : (
              <Tooltip title={"Read aloud"}>
                <button
                  onClick={handleReadAloud}
                  className={`flex gap-2 rounded-md p-1 hover:bg-[#e8e8e8] hover:text-gray-700  `}
                >
                  <Volume2 size={16} />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
