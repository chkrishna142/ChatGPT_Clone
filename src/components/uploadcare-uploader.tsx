"use client";

import "@uploadcare/react-uploader/core.css";
import { FileUploaderRegular } from "@uploadcare/react-uploader/next";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Custom styles to override Uploadcare's default styling
const customUploadcareStyles = `
  /* Main widget styling - keep it white */
  .uploadcare-container .uc-light {
    background: white !important;
    background-color: white !important;
    border: none !important;
    box-shadow: none !important;
  }
  
  .uploadcare-container .uc-light .uploadcare-widget {
    background: white !important;
    background-color: white !important;
    border-radius: 8px !important;
    border: 1px solid #e5e7eb !important;
  }
  
  .uploadcare-container .uc-light .uploadcare-widget__button {
    background: #f3f4f6 !important;
    background-color: #f3f4f6 !important;
    border: 1px solid #d1d5db !important;
    color: #374151 !important;
  }
  
  .uploadcare-container .uc-light .uploadcare-widget__button:hover {
    background: #e5e7eb !important;
    background-color: #e5e7eb !important;
  }
  
  .uploadcare-container .uc-light .uploadcare-widget__dragndrop {
    background: #f9fafb !important;
    background-color: #f9fafb !important;
    border: 2px dashed #d1d5db !important;
    border-radius: 8px !important;
  }
  
  .uploadcare-container .uc-light .uploadcare-widget__dragndrop:hover {
    border-color: #9ca3af !important;
    background: #f3f4f6 !important;
    background-color: #f3f4f6 !important;
  }
  
  /* Fix Uploadcare's internal modals and dialogs */
  .uploadcare-dialog,
  .uploadcare-dialog *,
  .uploadcare-widget__dialog,
  .uploadcare-widget__dialog *,
  .uploadcare-widget__source,
  .uploadcare-widget__source *,
  .uploadcare-widget__source-tabs,
  .uploadcare-widget__source-tabs *,
  .uploadcare-widget__source-tabs__tab,
  .uploadcare-widget__source-tabs__tab * {
    background: white !important;
    background-color: white !important;
  }
  
  /* File picker dialog */
  .uploadcare-widget__source-tabs__tab,
  .uploadcare-widget__source-tabs__tab:hover {
    background: #f9fafb !important;
    background-color: #f9fafb !important;
    border: 1px solid #e5e7eb !important;
    color: #374151 !important;
  }
  
  .uploadcare-widget__source-tabs__tab--active {
    background: #e5e7eb !important;
    background-color: #e5e7eb !important;
    border: 1px solid #d1d5db !important;
  }
  
  /* Camera interface */
  .uploadcare-widget__camera,
  .uploadcare-widget__camera * {
    background: white !important;
    background-color: white !important;
  }
  
  /* File list */
  .uploadcare-widget__file-list,
  .uploadcare-widget__file-list * {
    background: white !important;
    background-color: white !important;
  }
  
  /* Progress bars */
  .uploadcare-widget__progress,
  .uploadcare-widget__progress * {
    background: #f3f4f6 !important;
    background-color: #f3f4f6 !important;
  }
  
  /* Ensure all Uploadcare elements have proper backgrounds */
  .uploadcare-widget__source-dialog,
  .uploadcare-widget__source-dialog *,
  .uploadcare-widget__source-dialog-content,
  .uploadcare-widget__source-dialog-content * {
    background: white !important;
    background-color: white !important;
  }
  
  /* Override any potential transparent overlays */
  .uploadcare-widget__overlay {
    background: rgba(0, 0, 0, 0.5) !important;
  }
  
  /* But keep the main widget content white */
  .uploadcare-widget__overlay .uploadcare-widget,
  .uploadcare-widget__overlay .uploadcare-widget * {
    background: white !important;
    background-color: white !important;
  }
  
  /* Ensure Uploadcare's internal modals have proper z-index */
  .uploadcare-widget__overlay {
    z-index: 10000 !important;
  }
  
  .uploadcare-widget__dialog,
  .uploadcare-widget__source-dialog {
    z-index: 10001 !important;
    background: white !important;
    background-color: white !important;
  }
  
  /* Fix any iframe or embedded content */
  .uploadcare-widget iframe,
  .uploadcare-widget__iframe {
    background: white !important;
    background-color: white !important;
  }
  
  /* Additional source-specific styling */
  .uploadcare-widget__source-dialog-content,
  .uploadcare-widget__source-dialog-content * {
    background: white !important;
    background-color: white !important;
  }
  
  /* Google Drive, Dropbox, etc. iframe content */
  .uploadcare-widget__source-dialog iframe {
    background: white !important;
    background-color: white !important;
  }
`;

interface UploadcareUploaderProps {
  onFilesSelected: (files: any[]) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function UploadcareUploader({
  onFilesSelected,
  onClose,
  isOpen,
}: UploadcareUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const callbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset uploaded files when modal opens and manage body scroll
  useEffect(() => {
    if (isOpen) {
      setUploadedFiles([]);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = "unset";
      // Clear any pending callbacks when modal closes
      if (callbackTimeoutRef.current) {
        clearTimeout(callbackTimeoutRef.current);
        callbackTimeoutRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
      if (callbackTimeoutRef.current) {
        clearTimeout(callbackTimeoutRef.current);
      }
    };
  }, [isOpen]);

  // Inject custom styles when component mounts and re-inject when modal opens
  useEffect(() => {
    const styleId = "uploadcare-custom-styles";

    const injectStyles = () => {
      // Remove existing styles if they exist
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }

      // Add custom styles
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = customUploadcareStyles;
      document.head.appendChild(style);
    };

    // Inject styles immediately
    injectStyles();

    // Re-inject styles when modal opens (for dynamically created elements)
    if (isOpen) {
      const timer = setTimeout(injectStyles, 100);
      return () => clearTimeout(timer);
    }

    // Cleanup on unmount
    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [isOpen]);

  const handleFileUpload = (file: any) => {
    if (file && file.cdnUrl) {
      const fileInfo = {
        url: file.cdnUrl,
        name: file.name || "Unknown file",
        size: file.size || 0,
        type: file.mimeType || "application/octet-stream",
        uuid: file.uuid,
      };

      setUploadedFiles((prev) => {
        const newFiles = [...prev, fileInfo];

        console.log(
          `📤 Uploadcare file uploaded: ${fileInfo.name}, total files: ${newFiles.length}`
        );

        // Clear any existing timeout
        if (callbackTimeoutRef.current) {
          clearTimeout(callbackTimeoutRef.current);
        }

        // Schedule callback with all accumulated files after a delay
        // This allows multiple files to be collected before calling the parent
        callbackTimeoutRef.current = setTimeout(() => {
          console.log(
            `📤 Calling onFilesSelected with all ${newFiles.length} files`
          );
          onFilesSelected(newFiles);
        }, 200); // Increased delay to allow multiple files to accumulate

        return newFiles;
      });
    }
  };

  // handleDone removed - now using onFileUploadSuccess with auto-close

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 h-[150px] overflow-hidden shadow-2xl border border-gray-200 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Upload Files via Uploadcare
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        <div className="uploadcare-container bg-white">
          <FileUploaderRegular
            sourceList="local, camera, facebook, gdrive, dropbox, url"
            classNameUploader="uc-light"
            pubkey="ea8b640d9e0c6ca53418"
            multiple={true}
            imgOnly={false}
            onFileUploadSuccess={handleFileUpload}
            removeCopyright={true}
            confirmUpload={false}
          />
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
}
