"use client";

import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { SearchModal } from "@/components/ui/search-modal";
import { ShareModal } from "@/components/ui/share-modal";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
// MUI Icons

//react icons
import Tooltip from "@mui/material/Tooltip";
import { CgSearch } from "react-icons/cg";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { LuPencil } from "react-icons/lu";
import { PiImagesSquareLight, PiSidebarSimple } from "react-icons/pi";
import { RiShare2Line } from "react-icons/ri";

interface SidebarProps {
  chats: any[];
  currentChatId?: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string, hideSidebar?: boolean) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  user?: any;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  user,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isCollapsed =
    externalIsCollapsed !== undefined
      ? externalIsCollapsed
      : internalIsCollapsed;
  const setIsCollapsed = onToggleCollapse || setInternalIsCollapsed;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [chatToShare, setChatToShare] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const userButtonRef = useRef<HTMLDivElement>(null);

  const handleUserAreaClick = () => {
    // Find the UserButton element and trigger a click
    const userButtonElement = userButtonRef.current?.querySelector("button");
    if (userButtonElement) {
      userButtonElement.click();
    }
  };

  const handleMenuClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === chatId ? null : chatId);
  };

  const handleRename = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
    setOpenMenuId(null);
  };

  const handleRenameSubmit = (chatId: string) => {
    if (editingTitle.trim()) {
      onRenameChat(chatId, editingTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle("");

    // Hide sidebar on mobile after successful rename
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  };

  const handleRenameCancel = () => {
    setEditingChatId(null);
    setEditingTitle("");

    // Hide sidebar on mobile after canceling rename
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  };

  const handleShare = (chatId: string, chatTitle: string) => {
    setChatToShare({ id: chatId, title: chatTitle });
    setShareModalOpen(true);
    setOpenMenuId(null);
  };

  const closeShareModal = () => {
    setChatToShare(null);
    setShareModalOpen(false);
  };

  const handleDelete = (chatId: string, chatTitle: string) => {
    setChatToDelete({ id: chatId, title: chatTitle });
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete.id);
      setChatToDelete(null);
    }
  };

  const cancelDelete = () => {
    setChatToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleSearchModalOpen = () => {
    setSearchModalOpen(true);
  };

  const handleSearchModalClose = () => {
    setSearchModalOpen(false);
  };

  const handleSearchChatSelect = (chatId: string) => {
    onSelectChat(chatId, true); // true = hide sidebar on mobile
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        const target = event.target as Element;
        if (!target.closest("[data-menu-container]")) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);
  return (
    <div
      className={cn(
        "flex flex-col h-full gap-0 bg-[#f9f9f9] text-[#0D0D0D] text-xs transition-all duration-300 border-r border-gray-200",
        isCollapsed ? "w-12.5" : "w-64",
        // Mobile positioning and z-index
        "md:relative md:z-auto",
        // Only hide on mobile when collapsed, always show on desktop
        isCollapsed ? "hidden md:flex" : "fixed md:relative z-50 left-0 top-0"
      )}
    >
      {/* Top Navigation */}
      <div className="flex flex-col p-0 gap-0">
        {/* Toggle Button */}
        <div
          className={cn(
            "flex items-center justify-center   p-2",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onNewChat();
                // Hide sidebar on mobile after creating new chat, but only if not editing
                if (window.innerWidth < 768 && editingChatId === null) {
                  setIsCollapsed(true);
                }
              }}
              className={cn(
                "text-[#0D0D0D] w-10 h-10 flex items-center justify-center transition-colors",
                "hover:bg-[#ececec]"
              )}
              style={{ padding: 0 }}
            >
              <Tooltip title="New chat" placement="right">
                <div className="w-5 h-5 flex items-center justify-center">
                  <img
                    src="/gpticon.webp"
                    alt="New chat"
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </Tooltip>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(false)}
              className={cn(
                "text-[#0D0D0D] w-10 h-10 flex items-center justify-center transition-colors group",
                "hover:bg-[#ececec]"
              )}
              style={{ padding: 0 }}
            >
              <div className="w-5 h-5 flex items-center justify-center relative">
                <img
                  src="/gpticon.webp"
                  alt="Expand sidebar"
                  className="absolute inset-0 transition-opacity duration-150 group-hover:opacity-0"
                  style={{ cursor: "pointer" }}
                />

                <Tooltip title="Open sidebar" placement="right">
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <PiSidebarSimple size={20} />
                  </span>
                </Tooltip>
              </div>
            </Button>
          )}

          {!isCollapsed && (
            <Tooltip title="Close sidebar" placement="right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "text-[#0D0D0D] w-10 h-10 flex items-center justify-center transition-colors",
                  "hover:bg-[#ececec]"
                )}
              >
                <PiSidebarSimple size={20} />
              </Button>
            </Tooltip>
          )}
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-1 py-2 px-1">
          {/* New Chat */}
          <Tooltip title="New chat" placement="right">
            <Button
              onClick={() => {
                onNewChat();
                // Hide sidebar on mobile after creating new chat, but only if not editing
                if (window.innerWidth < 768 && editingChatId === null) {
                  setIsCollapsed(true);
                }
              }}
              variant="ghost"
              className={cn(
                "w-full justify-start text-[#0D0D0D] hover:bg-[#ececec] py-2 text-sm rounded-lg",
                isCollapsed ? "px-0 justify-center" : "px-3"
              )}
            >
              <FiEdit size={16} className={!isCollapsed ? "mr-2 " : ""} />
              {!isCollapsed && (
                <span className="text-sm font-normal">New chat</span>
              )}
            </Button>
          </Tooltip>

          {/* Search */}
          <Tooltip title="Search chats" placement="right">
            <Button
              onClick={handleSearchModalOpen}
              variant="ghost"
              className={cn(
                "w-full justify-start text-[#0D0D0D] hover:bg-[#ececec] py-2 text-sm rounded-lg",
                isCollapsed ? "px-0 justify-center" : "px-3"
              )}
            >
              <CgSearch size={18} className={!isCollapsed ? "mr-2" : ""} />
              {!isCollapsed && (
                <span className="text-sm font-normal">Search chats</span>
              )}
            </Button>
          </Tooltip>

          {/* Library */}
          <Tooltip title="Library" placement="right">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-[#0D0D0D] hover:bg-[#ececec] py-2 text-sm rounded-lg",
                isCollapsed ? "px-0 justify-center" : "px-3"
              )}
            >
              <PiImagesSquareLight
                size={18}
                className={!isCollapsed ? "mr-2" : ""}
              />
              {!isCollapsed && (
                <span className="text-sm font-normal">Library</span>
              )}
            </Button>
          </Tooltip>
        </div>
      </div>
      {/* Chat List */}
      {!isCollapsed && (
        <>
          <div className="px-2 py-2">
            <div className="text-sm font-normal text-[#8e8ea0] px-3 py-2">
              Chats
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {chats?.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg transition-colors group text-sm relative cursor-pointer",
                  currentChatId === chat.id
                    ? "bg-[#ececec] "
                    : "hover:bg-[#ececec]"
                )}
                onClick={(e) => {
                  if (editingChatId === chat.id) {
                    e.preventDefault();
                    return;
                  }
                  // Keep sidebar open if editing any chat

                  if (editingChatId) {
                    onSelectChat(chat.id, false);
                  } else {
                    onSelectChat(chat.id, true);
                  }
                }}
              >
                <div className="flex-1 overflow-hidden">
                  {editingChatId === chat.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleRenameSubmit(chat.id);
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          handleRenameCancel();
                        }
                      }}
                      onBlur={(e) => {
                        e.preventDefault();
                        handleRenameSubmit(chat.id);
                      }}
                      className="w-full bg-transparent border-none outline-none text-sm font-normal"
                      autoFocus
                    />
                  ) : (
                    <p className="truncate font-normal text-sm">{chat.title}</p>
                  )}
                </div>

                {/* Menu Button */}
                <div className="relative" data-menu-container>
                  <button
                    onClick={(e) => handleMenuClick(e, chat.id)}
                    className={cn(
                      "p-1 rounded hover:bg-[#d1d1d1] transition-colors",
                      "opacity-0 group-hover:opacity-100",
                      openMenuId === chat.id ? "opacity-100" : ""
                    )}
                  >
                    <HiOutlineDotsHorizontal size={14} />
                  </button>

                  {/* Popover Menu */}
                  {openMenuId === chat.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 min-w-[140px] px-1 gap-2">
                      <button
                        onClick={() => handleShare(chat.id, chat.title)}
                        className="flex rounded-lg items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <RiShare2Line size={14} className="mr-2" />
                        Share
                      </button>
                      <button
                        onClick={() => handleRename(chat.id, chat.title)}
                        className="flex rounded-lg items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LuPencil size={14} className="mr-2" />
                        Rename
                      </button>
                      <button
                        onClick={() => handleDelete(chat.id, chat.title)}
                        className="flex rounded-lg items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiTrash2 size={14} className="mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Bottom Section */}
      <div className="p-1 border-t border-gray-200 mt-auto">
        <div
          className="flex items-center gap-2 hover:bg-[#ececec] p-2 rounded-lg cursor-pointer"
          onClick={handleUserAreaClick}
        >
          <div ref={userButtonRef}>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-4 h-4",
                  userButtonPopoverCard: "bg-[#2d2d2d] border-[#404040]",
                  userButtonPopoverActionButton:
                    "text-gray-300 hover:text-[#0D0D0D] hover:bg-[#404040]",
                },
              }}
            />
          </div>

          {!isCollapsed && (
            <div className="pointer-events-none">
              <p>{user?.fullName}</p>
              <p className="text-[10px] text-[#8e8ea0]">Free</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete chat?"
        message={
          chatToDelete
            ? `This will delete`
            : "This will delete the selected chat."
        }
        boldMessage={`${chatToDelete?.title}.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />

      {/* Share Modal */}
      {chatToShare && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={closeShareModal}
          chatId={chatToShare.id}
          chatTitle={chatToShare.title}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={handleSearchModalClose}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSearchChatSelect}
      />
    </div>
  );
}
