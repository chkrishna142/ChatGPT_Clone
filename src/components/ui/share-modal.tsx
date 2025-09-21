"use client";

import { useState } from "react";
import { FiLink, FiX } from "react-icons/fi";
import { Button } from "./button";
import { Modal } from "./modal";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  chatTitle?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  chatId,
  chatTitle,
}: ShareModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      });

      if (response.ok) {
        const data = await response.json();
        const fullLink = `${window.location.origin}/share/${data.shareId}`;
        setShareLink(fullLink);
      } else {
        console.error("Failed to generate share link");
      }
    } catch (error) {
      console.error("Error generating share link:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleClose = () => {
    setShareLink("");
    setIsCopied(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Share public link to chat
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6">
          Your name, custom instructions, and any messages you add after sharing
          stay private.
        </p>

        {/* Share Link Section */}
        {shareLink ? (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                placeholder="https://chatgpt.com/share/..."
              />
            </div>
            <Button
              onClick={copyToClipboard}
              className={`px-6 py-2 h-9 text-sm font-medium rounded-full transition-all ${
                isCopied
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-900 hover:bg-gray-800 text-white"
              }`}
            >
              {isCopied ? "Copied!" : "Copy link"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
              <input
                type="text"
                value=""
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-400 outline-none"
                placeholder="https://chatgpt.com/share/..."
              />
            </div>
            <Button
              onClick={generateShareLink}
              disabled={isGenerating}
              className="px-6 py-2 h-9 text-sm font-medium rounded-full bg-gray-900 hover:bg-gray-800 text-white flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FiLink size={16} />
                  Create link
                </>
              )}
            </Button>
          </div>
        )}

        {/* Chat Info */}
        {/* <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-4 h-4 bg-green-600 rounded-full" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm mb-1">
                {chatTitle}
              </h3>
              <p className="text-xs text-gray-500">
                This chat will be shared as it appears now
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </Modal>
  );
}
