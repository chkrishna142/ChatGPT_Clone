"use client";

import { NativeFileUploader } from "@/components/native-file-uploader";
import { Button } from "@/components/ui/button";
import { Popover } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MoreHorizontal, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa6";
import { GoTelescope } from "react-icons/go";
import { HiOutlineLightBulb } from "react-icons/hi";
import { IoAttach } from "react-icons/io5";
import { MdMenuBook, MdUploadFile } from "react-icons/md";
import { PiImagesSquareLight } from "react-icons/pi";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  attachments: any[];
  isLoading: boolean;
  showUploadcareUploader: boolean;
  setShowUploadcareUploader: (show: boolean) => void;
  setIsMemoryPanelOpen: (open: boolean) => void;
  onNativeFileUpload?: (files: File[]) => void;
}

export function ChatInput({
  input,
  setInput,
  handleSubmit,
  handleKeyDown,
  attachments,
  isLoading,
  showUploadcareUploader,
  setShowUploadcareUploader,
  setIsMemoryPanelOpen,
  onNativeFileUpload,
}: ChatInputProps) {
  const [showPlusPopover, setShowPlusPopover] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form onSubmit={handleSubmit}>
      <div className="border flex flex-row gap-1 rounded-4xl max-h-full items-end border-gray-300 bg-white focus-within:border-gray-400 focus-within:shadow-md transition-all relative">
        {/* Left side - Plus Button */}
        <div className="pb-3 px-1">
          <Popover
            isOpen={showPlusPopover}
            onOpenChange={setShowPlusPopover}
            side="top"
            align="start"
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full text-black hover:text-gray-600 hover:bg-gray-100"
              >
                <Plus size={20} />
              </Button>
            }
          >
            <div className="w-60 space-y-1">
              <NativeFileUploader
                onFilesSelected={(files) => {
                  if (onNativeFileUpload) {
                    onNativeFileUpload(files);
                  }
                  setShowPlusPopover(false);
                }}
              >
                <button
                  type="button"
                  className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
                >
                  <IoAttach size={20} className="mr-3 text-gray-600" />
                  <span className="font-medium">Add photos & files</span>
                </button>
              </NativeFileUploader>
              <button
                onClick={() => {
                  setShowUploadcareUploader(true);
                  setShowPlusPopover(false);
                }}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
              >
                <MdUploadFile size={18} className="mr-3 text-gray-600" />
                <span className="font-medium">Upload files</span>
              </button>
              <button
                onClick={() => {
                  // TODO: Implement image creation
                  setShowPlusPopover(false);
                }}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
              >
                <PiImagesSquareLight size={20} className="mr-3 text-gray-600" />
                <span className="font-medium">Create image</span>
              </button>
              <button
                onClick={() => {
                  // TODO: Implement think longer
                  setShowPlusPopover(false);
                }}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
              >
                <HiOutlineLightBulb size={18} className="mr-3 text-gray-600" />
                <span className="font-medium">Think longer</span>
              </button>
              <button
                onClick={() => {
                  // TODO: Implement deep research
                  setShowPlusPopover(false);
                }}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
              >
                <GoTelescope size={18} className="mr-3 text-gray-600" />
                <span className="font-medium">Deep research</span>
              </button>
              <button
                onClick={() => {
                  setIsMemoryPanelOpen(true);
                  setShowPlusPopover(false);
                }}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
              >
                <MdMenuBook size={18} className="mr-3 text-gray-600" />
                <span className="font-medium">Study and learn</span>
              </button>
              <button
                onClick={() => {
                  // TODO: Implement more options
                  setShowPlusPopover(false);
                }}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
              >
                <MoreHorizontal size={18} className="mr-3 text-gray-600" />
                <span className="font-medium">More</span>
              </button>
            </div>
          </Popover>
        </div>

        {/* Input Field */}
        <div className="w-full">
          <div className="flex items-center py-2 pt-3 rounded-full bg-white transition">
            {/* The Textarea is styled to look like a single-line input, matching the image */}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize logic
                const textarea = textareaRef.current;
                if (textarea) {
                  textarea.style.height = "40px"; // reset to min height
                  textarea.style.height = `${Math.min(
                    textarea.scrollHeight,
                    200
                  )}px`;
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              className="min-h-[38px] max-h-[200px] shadow-none border-none rounded-md bg-transparent px-2 text-base focus:ring-0 focus:outline-none text-gray-800 flex-1 focus:border-none focus-visible:border-none focus-visible:ring-0"
              style={{
                lineHeight: "1.5",
                paddingTop: "0px",
                paddingBottom: "0px",
                resize: "none",
                overflowY: "auto",
                height: "40px",
                maxHeight: "200px",
                boxShadow: "none",
                border: "none",
              }}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center space-x-1 pb-4 px-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            title="Voice input"
          >
            <Mic size={20} />
          </Button>

          {(input.trim() || attachments.length > 0) && !isLoading && (
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 rounded-full bg-black hover:bg-gray-800 text-white"
            >
              <FaArrowUp size={16} className="text-white" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
