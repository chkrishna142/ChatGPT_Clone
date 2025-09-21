"use client";

import { ChatInput } from "@/components/chat-input";
import { ChatMessage } from "@/components/chat-message";
import { MemoryPanel } from "@/components/memory-panel";
import { ConfirmationModal, ShareModal, showToast } from "@/components/ui";
import { UploadcareUploader } from "@/components/uploadcare-uploader";
import { FaReact } from "react-icons/fa";
import { IoCheckmarkOutline } from "react-icons/io5";
import { LuDiamondMinus } from "react-icons/lu";
import { RiShare2Line } from "react-icons/ri";

import { CircularProgress } from "@/components/ui/circular-progress";
import { Message, UploadedFile } from "@/types";
import { RiArrowDropDownLine } from "react-icons/ri";

import { FileText, Image, Menu, MoreHorizontal } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiTrash2 } from "react-icons/fi";

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, attachments?: UploadedFile[]) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onLikeMessage?: (messageId: string, liked: boolean) => void;
  onDislikeMessage?: (messageId: string, disliked: boolean) => void;
  currentChatId?: string;
  currentChatTitle?: string;
  onDeleteChat?: (chatId: string) => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  onEditMessage,
  onLikeMessage,
  onDislikeMessage,
  currentChatId,
  currentChatTitle = "New Chat",
  onDeleteChat,
  sidebarCollapsed,
  onToggleSidebar,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const lastUploadTimeRef = useRef<number>(0);
  const [isMemoryPanelOpen, setIsMemoryPanelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("ChatGPT");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadcareUploader, setShowUploadcareUploader] = useState(false);
  const [showPlusPopover, setShowPlusPopover] = useState(false);
  const [isDeletingAttachment, setIsDeletingAttachment] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || attachments.length > 0) {
      onSendMessage(input.trim(), attachments);
      setInput("");
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // File selection now handled by Uploadcare - handleFileSelect removed

  const handleUploadcareFiles = useCallback(async (uploadcareFiles: any[]) => {
    console.log(
      "🔄 handleUploadcareFiles called with:",
      uploadcareFiles.length,
      "files"
    );
    console.log(
      "File UUIDs:",
      uploadcareFiles.map((f) => f.uuid)
    );

    if (!uploadcareFiles || uploadcareFiles.length === 0) return;

    // Debounce rapid successive calls (within 200ms)
    const now = Date.now();
    if (now - lastUploadTimeRef.current < 200) {
      console.log("⏱️ Debouncing rapid upload calls");
      return;
    }
    lastUploadTimeRef.current = now;

    // Filter out files that are already in attachments to prevent duplicates
    // Use functional update to get the current attachments state
    setAttachments((currentAttachments) => {
      const existingUuids = new Set(
        currentAttachments.map((att) => att.uuid).filter(Boolean)
      );
      const newFiles = uploadcareFiles.filter(
        (file) => !existingUuids.has(file.uuid)
      );

      if (newFiles.length === 0) {
        console.log("All files already in attachments, skipping duplicates");
        return currentAttachments; // Return current state unchanged
      }

      console.log(
        `Processing ${newFiles.length} new files, skipping ${
          uploadcareFiles.length - newFiles.length
        } duplicates`
      );

      // Process Uploadcare files directly without transferring to Cloudinary
      const processedFiles = newFiles.map((file) => {
        // Better MIME type detection for Uploadcare files
        let mimeType = file.mimeType || "application/octet-stream";

        console.log(
          `🔍 Uploadcare file: ${file.name}, original mimeType: ${file.mimeType}, detected: ${mimeType}`
        );

        // If Uploadcare doesn't provide proper MIME type, try to detect from filename
        if (mimeType === "application/octet-stream" && file.name) {
          const extension = file.name.toLowerCase().split(".").pop();
          const mimeTypeMap: { [key: string]: string } = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            gif: "image/gif",
            webp: "image/webp",
            pdf: "application/pdf",
            txt: "text/plain",
            csv: "text/csv",
            doc: "application/msword",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            xls: "application/vnd.ms-excel",
            xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ppt: "application/vnd.ms-powerpoint",
            pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          };

          if (extension && mimeTypeMap[extension]) {
            mimeType = mimeTypeMap[extension];
            console.log(
              `✅ Detected MIME type from extension: ${extension} -> ${mimeType}`
            );
          }
        }

        // Create UploadedFile object with Uploadcare data
        // We create a plain object that implements the UploadedFile interface
        const uploadedFile: UploadedFile = {
          // File properties
          name: file.name || file.originalFilename || "Unknown file",
          size: file.size || 0,
          type: mimeType,
          lastModified: Date.now(),
          webkitRelativePath: "",

          // File methods (empty implementations since we don't need them for display)
          slice: () => new Blob(),
          stream: () => new ReadableStream(),
          text: () => Promise.resolve(""),
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),

          // Custom UploadedFile properties
          url: file.url || file.cdnUrl, // Use Uploadcare CDN URL directly
          uuid: file.uuid, // Store Uploadcare UUID
          source: "uploadcare" as const,
          isUploading: false, // No need for uploading state since file is already on Uploadcare
          uploadProgress: undefined,
        } as UploadedFile;

        return uploadedFile;
      });

      // Add processed files to attachments
      console.log(
        "Before adding attachments - current count:",
        currentAttachments.length
      );
      console.log(
        "Files to add:",
        processedFiles.map((f) => ({ name: f.name, uuid: f.uuid }))
      );

      const newAttachments = [...currentAttachments, ...processedFiles];
      console.log(
        "After adding attachments - new count:",
        newAttachments.length
      );
      console.log(
        "All attachment UUIDs:",
        newAttachments.map((a) => a.uuid)
      );
      return newAttachments;
    });
  }, []); // No dependencies needed since we use setAttachments with function

  // Handle native file uploads
  const handleNativeFileUpload = async (files: File[]) => {
    // Check for invalid file types first
    console.log(
      "🔄 handleNativeFileUpload called with:",
      files.length,
      "files"
    );
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-powerpoint",
    ];

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach((file) => {
      if (allowedTypes.includes(file.type)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    // Show toast for invalid files
    if (invalidFiles.length > 0) {
      const supportedTypes =
        "Images (JPG, PNG, GIF, WebP), PDF, TXT, CSV, DOCX, DOC, XLSX, XLS, PPTX, PPT";
      showToast(
        `Invalid file types: ${invalidFiles.join(
          ", "
        )}. Supported: ${supportedTypes}`,
        "error",
        8000
      );
    }

    // Only proceed with valid files
    if (validFiles.length === 0) return;

    // Add valid files to attachments with uploading state
    const uploadingFiles = validFiles.map((file) => ({
      ...file,
      url: "",
      publicId: "",
      source: "cloudinary" as const,
      isUploading: true,
      uploadProgress: 0,
      name: file.name || "Unknown file",
      type: file.type || "application/octet-stream",
      // Note: We'll determine the attachment type later in use-chat.ts based on MIME type
    }));

    setAttachments((prev) => [...prev, ...uploadingFiles]);

    // Upload files one by one to track individual progress
    // First, get the starting index after adding uploading files
    const startingIndex = attachments.length;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const attachmentIndex = startingIndex + i;

      console.log(
        `📤 Starting upload for file handleNativeFileUpload ${i + 1}/${
          validFiles.length
        }:`,
        {
          filename: file.name,
          mimeType: file.type,
          attachmentIndex: attachmentIndex,
          startingIndex: startingIndex,
          currentAttachmentsLength: attachments.length,
        }
      );

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setAttachments((prev) => {
            const newAttachments = [...prev];
            if (newAttachments[attachmentIndex]) {
              newAttachments[attachmentIndex] = {
                ...newAttachments[attachmentIndex],
                uploadProgress: Math.min(
                  (newAttachments[attachmentIndex].uploadProgress || 0) +
                    Math.random() * 20,
                  90
                ),
              };
            }
            return newAttachments;
          });
        }, 200);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const result = await response.json();

        console.log(` Upload successful for ${file.name}:`, {
          result: result,
          attachmentIndex: attachmentIndex,
          url: result.url,
          publicId: result.publicId,
          fileType: file.type,
          originalName: file.name,
        });

        // Test URL accessibility for PDFs
        if (file.type === "application/pdf") {
          console.log(`Testing PDF URL accessibility: ${result.url}`);
          fetch(result.url, { method: "HEAD" })
            .then((response) => {
              console.log(`PDF URL response:`, {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
              });
            })
            .catch((error) => {
              console.error(` PDF URL test failed:`, error);
            });
        }

        // Update attachment with successful upload
        setAttachments((prev) => {
          const newAttachments = [...prev];

          if (newAttachments[attachmentIndex]) {
            console.log(`📝 Before update:`, newAttachments[attachmentIndex]);
            newAttachments[attachmentIndex] = {
              ...newAttachments[attachmentIndex],
              url: result.url,
              publicId: result.publicId,
              isUploading: false,
              uploadProgress: 100,
            };
          } else {
          }
          return newAttachments;
        });

        // Remove progress after a short delay
        setTimeout(() => {
          setAttachments((prev) => {
            const newAttachments = [...prev];
            if (newAttachments[attachmentIndex]) {
              newAttachments[attachmentIndex] = {
                ...newAttachments[attachmentIndex],
                uploadProgress: undefined,
              };
            }
            return newAttachments;
          });
        }, 1000);
      } catch (error) {
        console.error("Error uploading file:", error);

        // Remove failed upload
        setAttachments((prev) =>
          prev.filter((_, index) => index !== attachmentIndex)
        );

        // Show error toast
        showToast(
          `Failed to upload ${file.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          "error"
        );
      }
    }
  };

  const removeAttachment = async (index: number) => {
    const attachment = attachments[index];

    // Set deleting state to show disabled state on all attachments
    setIsDeletingAttachment(true);

    try {
      // Handle deletion based on file source
      if (
        attachment?.source === "cloudinary" &&
        attachment?.publicId &&
        !attachment.isUploading
      ) {
        // Delete from Cloudinary for Cloudinary files
        const response = await fetch("/api/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publicId: attachment.publicId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to delete from Cloudinary:", errorData.error);
          showToast("Failed to delete file from cloud storage", "error");
        }
      } else if (attachment?.source === "uploadcare" && attachment?.uuid) {
        // Delete from Uploadcare storage
        const response = await fetch("/api/uploadcare-delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uuid: attachment.uuid }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to delete from Uploadcare:", errorData.error);
          showToast("Failed to delete file from Uploadcare storage", "error");
        }
      }
      // For files without source or publicId/uuid, just remove from local state

      // Remove from local state regardless of deletion success
      setAttachments((prev) => prev.filter((_, i) => i !== index));
    } finally {
      // Reset deleting state
      setIsDeletingAttachment(false);
    }
  };

  const handleDeleteChat = () => {
    if (currentChatId && onDeleteChat) {
      onDeleteChat(currentChatId);
      setShowDeleteModal(false);
    }
  };

  const models = [
    {
      id: "chatgpt-go",
      name: "ChatGPT Go",
      icon: <LuDiamondMinus size={18} className="mr-2" />,

      description: "Great for everyday tasks",
    },
    {
      id: "chatgpt",
      name: "ChatGPT",
      icon: <FaReact size={18} className="mr-2" />,
      description: "Our smartest model & more",
    },
  ];

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-dropdown]")) {
        setIsModelDropdownOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between w-full mx-auto ">
          {/* Hamburger Menu - Only visible on mobile */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Model Selector */}
          <div className="relative md:block flex-1" data-dropdown>
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors md:ml-0 ml-2"
            >
              <span>{selectedModel}</span>
              <RiArrowDropDownLine size={30} className="text-gray-500" />
            </button>

            {/* Model Dropdown */}
            {isModelDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.name);
                      setIsModelDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-row items-center flex-1">
                      {model.icon}
                      <div className=" flex-col gap-1">
                        <div className="font-medium text-gray-900 text-sm flex flex-row items-center">
                          {model.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {model.description}
                        </div>
                      </div>
                    </div>

                    {selectedModel === model.name && (
                      <IoCheckmarkOutline size={18} className="mr-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Share Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={!currentChatId || messages.length === 0}
            >
              <RiShare2Line size={18} className="" />
            </button>

            {/* More Menu */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreHorizontal size={18} />
              </button>

              {/* Menu Dropdown */}
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  <button
                    onClick={() => {
                      setShowShareModal(true);
                      setIsMenuOpen(false);
                    }}
                    disabled={!currentChatId || messages.length === 0}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RiShare2Line size={18} className=" mr-3" />
                    Share
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setIsMenuOpen(false);
                    }}
                    disabled={!currentChatId}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiTrash2 size={16} className="mr-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                What's on the agenda today?
              </h2>
            </div>
            <div className="bg-white px-4 py-4 w-full">
              <div className="max-w-3xl mx-auto">
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                          file.isUploading
                            ? "bg-blue-50 border border-blue-200"
                            : isDeletingAttachment
                            ? "bg-gray-50 border border-gray-200 opacity-60"
                            : "bg-gray-100"
                        }`}
                      >
                        {(file.type || "").startsWith("image/") ? (
                          file.url ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="mr-2 w-8 h-8 object-cover rounded text-blue-500 cursor-pointer hover:opacity-80"
                              onClick={() => {
                                window.open(file.url, "_blank");
                              }}
                            />
                          ) : (
                            <Image size={16} className="mr-2 text-blue-500" />
                          )
                        ) : (
                          <FileText size={16} className="mr-2 text-gray-500" />
                        )}
                        <span
                          className="truncate max-w-32 cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            if (file.url) {
                              console.log(`🔗 Opening file:`, {
                                url: file.url,
                                name: file.name,
                                type: file.type,
                                source: file.source,
                              });

                              // For PDFs, try different opening strategies
                              if (file.type === "application/pdf") {
                                console.log(`📄 Opening PDF: ${file.url}`);
                                // Try opening in new tab first
                                const newWindow = window.open(
                                  file.url,
                                  "_blank"
                                );
                                if (!newWindow) {
                                  console.log(
                                    "❌ Popup blocked, trying direct navigation"
                                  );
                                  // If popup blocked, try direct navigation
                                  window.location.href = file.url;
                                }
                              } else {
                                window.open(file.url, "_blank");
                              }
                            }
                          }}
                          title="Click to open file"
                        >
                          {file.name || "Unknown file"}
                        </span>
                        {file.isUploading &&
                          file.uploadProgress !== undefined && (
                            <div className="ml-2">
                              <CircularProgress
                                progress={file.uploadProgress}
                                size={16}
                                strokeWidth={2}
                                className="text-blue-500"
                              />
                            </div>
                          )}
                        {!file.isUploading && (
                          <button
                            onClick={() => removeAttachment(index)}
                            disabled={isDeletingAttachment}
                            className={`ml-2 transition-colors ${
                              isDeletingAttachment
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {isDeletingAttachment ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                            ) : (
                              "×"
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Input Form */}
                <ChatInput
                  input={input}
                  setInput={setInput}
                  handleSubmit={handleSubmit}
                  handleKeyDown={handleKeyDown}
                  attachments={attachments}
                  isLoading={isLoading}
                  showUploadcareUploader={showUploadcareUploader}
                  setShowUploadcareUploader={setShowUploadcareUploader}
                  setIsMemoryPanelOpen={setIsMemoryPanelOpen}
                  onNativeFileUpload={handleNativeFileUpload}
                />

                {/* File input removed - now using Uploadcare */}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {messages?.map((message) => {
              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onEdit={onEditMessage}
                  onLike={onLikeMessage}
                  onDislike={onDislikeMessage}
                  chatId={currentChatId}
                  attachments={message.attachments || []}
                />
              );
            })}
            {isLoading && (
              <div className="group w-full text-gray-800  border-black/10  ">
                <div className="flex p-4 gap-4 text-base md:gap-6 md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl md:py-6 lg:px-0 m-auto">
                  <div className="relative flex w-[calc(100%-50px)] flex-col gap-1 md:gap-3 lg:w-[calc(100%-115px)]">
                    <div className="flex items-center space-x-2 ">
                      <div className="w-[20px] h-[20px] bg-black rounded-full animate-pulse border border-black"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {messages.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4">
          <div className="max-w-3xl mx-auto">
            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                          file.isUploading
                            ? "bg-blue-50 border border-blue-200"
                            : isDeletingAttachment
                            ? "bg-gray-50 border border-gray-200 opacity-60"
                            : "bg-gray-100"
                        }`}
                      >
                        {(file.type || "").startsWith("image/") ? (
                          file.url ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="mr-2 w-8 h-8 object-cover rounded text-blue-500 cursor-pointer hover:opacity-80"
                              onClick={() => {
                                console.log(`🖼️ Opening image:`, {
                                  url: file.url,
                                  name: file.name,
                                  type: file.type,
                                  source: file.source,
                                });
                                window.open(file.url, "_blank");
                              }}
                            />
                          ) : (
                            <Image size={16} className="mr-2 text-blue-500" />
                          )
                        ) : (
                          <FileText size={16} className="mr-2 text-gray-500" />
                        )}
                        <span
                          className="truncate max-w-32 cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            if (file.url) {
                              console.log(`🔗 Opening file:`, {
                                url: file.url,
                                name: file.name,
                                type: file.type,
                                source: file.source,
                              });

                              // For PDFs, try different opening strategies
                              if (file.type === "application/pdf") {
                                console.log(`📄 Opening PDF: ${file.url}`);
                                // Try opening in new tab first
                                const newWindow = window.open(
                                  file.url,
                                  "_blank"
                                );
                                if (!newWindow) {
                                  console.log(
                                    "❌ Popup blocked, trying direct navigation"
                                  );
                                  // If popup blocked, try direct navigation
                                  window.location.href = file.url;
                                }
                              } else {
                                window.open(file.url, "_blank");
                              }
                            }
                          }}
                          title="Click to open file"
                        >
                          {file.name || "Unknown file"}
                        </span>
                        {file.isUploading &&
                          file.uploadProgress !== undefined && (
                            <div className="ml-2">
                              <CircularProgress
                                progress={file.uploadProgress}
                                size={16}
                                strokeWidth={2}
                                className="text-blue-500"
                              />
                            </div>
                          )}
                        {!file.isUploading && (
                          <button
                            onClick={() => removeAttachment(index)}
                            disabled={isDeletingAttachment}
                            className={`ml-2 transition-colors ${
                              isDeletingAttachment
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {isDeletingAttachment ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                            ) : (
                              "×"
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Input Form */}
            <ChatInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              handleKeyDown={handleKeyDown}
              attachments={attachments}
              isLoading={isLoading}
              showUploadcareUploader={showUploadcareUploader}
              setShowUploadcareUploader={setShowUploadcareUploader}
              setIsMemoryPanelOpen={setIsMemoryPanelOpen}
              onNativeFileUpload={handleNativeFileUpload}
            />

            {/* File input removed - now using Uploadcare */}
          </div>
        </div>
      )}

      {/* Memory Panel */}
      <MemoryPanel
        isOpen={isMemoryPanelOpen}
        onClose={() => setIsMemoryPanelOpen(false)}
      />

      {/* Share Modal */}
      {currentChatId && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          chatId={currentChatId}
          chatTitle={currentChatTitle}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteChat}
        title="Delete chat?"
        message="This will delete"
        boldMessage={`${currentChatTitle}.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />

      {/* Uploadcare Uploader Modal */}
      <UploadcareUploader
        isOpen={showUploadcareUploader}
        onClose={() => setShowUploadcareUploader(false)}
        onFilesSelected={handleUploadcareFiles}
      />
    </div>
  );
}
