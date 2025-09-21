"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Reusable Modal Component
 *
 * Usage Examples:
 *
 * Basic Modal:
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
 *   <div className="p-6">
 *     <h2>Modal Title</h2>
 *     <p>Modal content goes here</p>
 *   </div>
 * </Modal>
 *
 * Custom styled modal:
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   className="max-w-lg"
 *   overlayClassName="bg-blue-900/20"
 * >
 *   <CustomContent />
 * </Modal>
 */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  className,
  overlayClassName,
}: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        overlayClassName
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-100/10 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          "border border-gray-200",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
