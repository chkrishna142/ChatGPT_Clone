"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { useRef, useState } from "react";
// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";

interface SidebarProps {
  chats: any[];
  currentChatId?: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  user?: any;
}

export function Sidebar({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  user,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const userButtonRef = useRef<HTMLDivElement>(null);

  const handleUserAreaClick = () => {
    // Find the UserButton element and trigger a click
    const userButtonElement = userButtonRef.current?.querySelector("button");
    if (userButtonElement) {
      userButtonElement.click();
    }
  };
  return (
    <div
      className={cn(
        "flex flex-col h-full gap-0 bg-[#f9f9f9] text-[#0D0D0D] text-xs transition-all duration-300 border-r border-gray-200",
        isCollapsed ? "w-12.5" : "w-64"
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[#0D0D0D] hover:bg-[#2d2d2d] w-6 h-6 rounded-lg"
          >
            {isCollapsed ? (
              <MenuIcon sx={{ fontSize: 20 }} />
            ) : (
              <CloseIcon sx={{ fontSize: 20 }} />
            )}
          </Button>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-[#0D0D0D] hover:bg-[#2d2d2d] w-6 h-6 rounded-lg"
            >
              {isCollapsed ? (
                <MenuIcon sx={{ fontSize: 20 }} />
              ) : (
                <CloseIcon sx={{ fontSize: 20 }} />
              )}
            </Button>
          )}
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-1 py-2">
          {/* New Chat */}
          <Button
            onClick={onNewChat}
            variant="ghost"
            className={cn(
              "w-full justify-start text-[#0D0D0D] hover:bg-[#2d2d2d] h-6.5 text-sm rounded-lg",
              isCollapsed ? "px-0 justify-center" : "px-3"
            )}
          >
            <AddIcon
              sx={{ fontSize: 16 }}
              className={!isCollapsed ? "mr-2" : ""}
            />
            {!isCollapsed && (
              <span className="text-xs font-medium">New chat</span>
            )}
          </Button>

          {/* Search */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-[#0D0D0D] hover:bg-[#2d2d2d] h-6.5 text-sm rounded-lg",
              isCollapsed ? "px-0 justify-center" : "px-3"
            )}
          >
            <SearchIcon
              sx={{ fontSize: 16 }}
              className={!isCollapsed ? "mr-2" : ""}
            />
            {!isCollapsed && (
              <span className="text-xs font-medium">Search chats</span>
            )}
          </Button>

          {/* Library */}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-[#0D0D0D] hover:bg-[#2d2d2d] h-6.5 text-sm rounded-lg",
              isCollapsed ? "px-0 justify-center" : "px-3"
            )}
          >
            <LibraryBooksIcon
              sx={{ fontSize: 16 }}
              className={!isCollapsed ? "mr-2" : ""}
            />
            {!isCollapsed && (
              <span className="text-xs font-medium">Library</span>
            )}
          </Button>
        </div>
      </div>
      {/* Chat List */}
      {!isCollapsed && (
        <>
          <div className="px-2 py-2">
            <div className="text-xs font-medium text-[#8e8ea0] px-3 py-2">
              Chats
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "flex items-center px-3 py-1.5 rounded-lg cursor-pointer transition-colors group text-sm",
                  currentChatId === chat.id ? "bg-[#ececec] " : ""
                )}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium text-xs">{chat.title}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Bottom Section */}
      <div className="p-2  py-3">
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
          <div className="pointer-events-none">
            <p>{user?.fullName}</p>
            <p className="text-[10px] text-[#8e8ea0]">Free</p>
          </div>
        </div>
      </div>
    </div>
  );
}
