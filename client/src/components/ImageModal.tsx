import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Post } from "@/lib/types";
import { useEffect } from "react";
import LikeDislikeButton from "./LikeDislikeButton";

interface ImageModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({ post, isOpen, onClose }: ImageModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Handle ESC key press
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle click outside the content to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl max-h-screen p-4">
        {/* Close Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-0 right-0 m-4 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
          onClick={onClose}
        >
          <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Button>
        
        {/* Modal Content */}
        <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-xl">
          <div className="relative">
            <img 
              className="w-full max-h-[70vh] object-contain bg-gray-100 dark:bg-gray-800" 
              src={post.imagePath} 
              alt={post.title}
            />
          </div>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{post.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{post.description}</p>
            <div className="flex items-center justify-between flex-wrap mt-6">
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Shared {formatDate(post.createdAt)}
              </div>
              <LikeDislikeButton post={post} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
