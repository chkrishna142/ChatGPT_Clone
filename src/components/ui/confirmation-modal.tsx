"use client";

import { Button } from "./button";
import { Modal } from "./modal";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  boldMessage?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  boldMessage,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
  isLoading = false,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-4">
        {/* Title */}
        <h2 className="text-lg font-medium text-gray-900 mb-2">{title}</h2>

        {/* Message */}
        <p className="text-base  mb-6 leading-relaxed">
          {message}
          {boldMessage && (
            <span className="font-semibold ml-1">{boldMessage}</span>
          )}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 h-9 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 rounded-full"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 h-9 text-sm font-medium rounded-full ${
              confirmVariant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white border-0"
                : "bg-blue-600 hover:bg-blue-700 text-white border-0"
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
