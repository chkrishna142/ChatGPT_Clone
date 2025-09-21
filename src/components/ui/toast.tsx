"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

export function Toast({
  message,
  type = "info",
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white border-green-600";
      case "error":
        return "bg-red-500 text-white border-red-600";
      case "warning":
        return "bg-yellow-500 text-white border-yellow-600";
      case "info":
      default:
        return "bg-blue-500 text-white border-blue-600";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[10000] max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`${getToastStyles()} rounded-lg shadow-lg border p-4 flex items-center justify-between`}
      >
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-3 text-white hover:text-gray-200 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// Toast manager for handling multiple toasts
interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

let toastId = 0;
const toasts: ToastItem[] = [];
const listeners: ((toasts: ToastItem[]) => void)[] = [];

export function showToast(
  message: string,
  type: "success" | "error" | "warning" | "info" = "info",
  duration = 5000
) {
  const id = (++toastId).toString();
  const toast: ToastItem = { id, message, type, duration };

  toasts.push(toast);
  listeners.forEach((listener) => listener([...toasts]));

  return id;
}

export function ToastContainer() {
  const [toastList, setToastList] = useState<ToastItem[]>([]);

  useEffect(() => {
    const updateToasts = (newToasts: ToastItem[]) => {
      setToastList(newToasts);
    };

    listeners.push(updateToasts);

    return () => {
      const index = listeners.indexOf(updateToasts);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const removeToast = (id: string) => {
    const newToasts = toasts.filter((toast) => toast.id !== id);
    toasts.length = 0;
    toasts.push(...newToasts);
    listeners.forEach((listener) => listener([...toasts]));
  };

  return (
    <div className="fixed top-4 right-4 z-[10000] space-y-2">
      {toastList.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
