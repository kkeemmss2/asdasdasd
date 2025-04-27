export interface Post {
  id: number;
  title: string;
  description: string;
  imagePath: string;
  imageType: string;
  likes: number;
  dislikes: number;
  createdAt: string;
}

export interface UploadFormData {
  title: string;
  description: string;
  image: File | null;
}

export type NotificationType = 'success' | 'error' | 'warning';

export interface NotificationProps {
  message: string;
  type: NotificationType;
  isOpen: boolean;
  onClose: () => void;
}

export type SortOption = 'latest' | 'oldest';
