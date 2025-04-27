import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, XCircle, X } from "lucide-react";
import { NotificationType } from "@/lib/types";

interface NotificationProps {
  message: string;
  type: NotificationType;
  isOpen: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export default function Notification({
  message,
  type,
  isOpen,
  onClose,
  autoClose = true,
  duration = 5000,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          // Give time for exit animation
          setTimeout(onClose, 300);
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, autoClose, duration, onClose]);
  
  if (!isOpen && !isVisible) {
    return null;
  }
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      default:
        return <CheckCircle className="h-5 w-5 text-success" />;
    }
  };
  
  return (
    <div
      className={`fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center space-x-3 z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <span>{getIcon()}</span>
      <span className="text-gray-800 dark:text-gray-200">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
