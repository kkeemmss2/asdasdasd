import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import logoImage from './assets/logo.svg';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Simple types
interface Post {
  id: number;
  title: string;
  description: string;
  imagePath: string;
  imageType: string;
  likes: number;
  dislikes: number;
  createdAt: string;
}

type NotificationType = 'success' | 'error' | 'warning';
type SortOption = 'latest' | 'oldest';

// Utility functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

function validateImageFile(file: File): { valid: boolean; message?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      message: 'File type not supported. Please use JPG, PNG, or GIF.'
    };
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      message: 'File size exceeds 5MB limit.'
    };
  }
  
  return { valid: true };
}

// Main App Component
function App() {
  const [view, setView] = useState<'gallery' | 'upload'>('gallery');
  
  const toggleView = () => {
    setView(view === 'gallery' ? 'upload' : 'gallery');
  };
  
  // Set light mode for the entire app
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Header currentView={view} onToggleView={toggleView} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ImageGalleryApp initialView={view} onViewChange={setView} />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}

// Header Component with Navigation Bar
function Header({ currentView, onToggleView }: { currentView: 'gallery' | 'upload', onToggleView: () => void }) {
  return (
    <header className="bg-white shadow">
      <div className="navbar">
        <div className="wrapper">
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); }}>Sākums</a></li>
            <li><a href="#" className={currentView === 'gallery' ? 'active' : ''} onClick={(e) => { e.preventDefault(); currentView === 'upload' && onToggleView(); }}>Projekti</a></li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()} className="navbar-logo">
                <img src={logoImage} alt="Logo" className="h-10" />
              </a>
            </li>
            <li><a href="#" className={currentView === 'upload' ? 'active' : ''} onClick={(e) => { e.preventDefault(); currentView === 'gallery' && onToggleView(); }}>Pats Ievieto</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Par Mums</a></li>
          </ul>
        </div>
      </div>
    </header>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-center text-sm text-gray-400">&copy; {new Date().getFullYear()} ImageShare. All rights reserved.</p>
      </div>
    </footer>
  );
}

// Simple Notification Component
function Notification({ message, type, onClose }: { message: string, type: NotificationType, onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const getBackgroundColor = () => {
    switch(type) {
      case 'success': return 'bg-green-100';
      case 'error': return 'bg-red-100';
      case 'warning': return 'bg-yellow-100';
      default: return 'bg-blue-100';
    }
  };
  
  const getTextColor = () => {
    switch(type) {
      case 'success': return 'text-green-800';
      case 'error': return 'text-red-800';
      case 'warning': return 'text-yellow-800';
      default: return 'text-blue-800';
    }
  };
  
  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center ${getBackgroundColor()}`}>
      <span className={`${getTextColor()}`}>{message}</span>
      <button 
        className="ml-4 text-gray-400 hover:text-gray-500"
        onClick={onClose}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

// Like/Dislike Button Component
function LikeDislikeButton({ post, compact = false }: { post: Post, compact?: boolean }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [dislikesCount, setDislikesCount] = useState(post.dislikes);
  
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to like post');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setLikesCount(data.likes);
      setIsLiked(true);
      setIsDisliked(false);
    },
  });
  
  const dislikeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/dislike`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to dislike post');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setDislikesCount(data.dislikes);
      setIsDisliked(true);
      setIsLiked(false);
    },
  });
  
  return (
    <div className="flex gap-2">
      <button
        className={`px-3 py-1 rounded flex items-center ${isLiked 
          ? 'bg-green-500 text-white' 
          : 'bg-gray-100 text-gray-700'}`}
        onClick={() => !isLiked && likeMutation.mutate()}
        disabled={likeMutation.isPending || dislikeMutation.isPending}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        {compact ? '' : 'Like'} 
        <span className="ml-1">{likesCount}</span>
      </button>
      
      <button
        className={`px-3 py-1 rounded flex items-center ${isDisliked 
          ? 'bg-red-500 text-white' 
          : 'bg-gray-100 text-gray-700'}`}
        onClick={() => !isDisliked && dislikeMutation.mutate()}
        disabled={likeMutation.isPending || dislikeMutation.isPending}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
        </svg>
        {compact ? '' : 'Dislike'} 
        <span className="ml-1">{dislikesCount}</span>
      </button>
    </div>
  );
}

// Image Upload Component
function ImageUpload({ onSuccess }: { onSuccess: (message: string) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validation = validateImageFile(selectedFile);
      if (!validation.valid) {
        setError(validation.message || 'Invalid file');
        return;
      }
      
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an image to upload');
      return;
    }
    
    if (!title.trim()) {
      setError('Please enter a title for your image');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('image', file);
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }
      
      // Clear form
      setTitle('');
      setDescription('');
      setFile(null);
      setPreviewUrl(null);
      
      // Trigger success callback
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      onSuccess('Image uploaded successfully!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeSelectedFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload a New Image</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Image Upload Area */}
        {!previewUrl ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 mb-4"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-2 text-gray-500">Drag and drop your image here or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF (Max 5MB)</p>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept="image/jpeg,image/png,image/gif" 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="relative mb-4">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full max-h-60 object-contain rounded-lg bg-gray-100" 
            />
            <button
              type="button"
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
              onClick={removeSelectedFile}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Form Fields */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Give your image a title"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add a description for your image"
          />
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md">
            {error}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUploading || !file}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              'Upload Image'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Image Item Component
function ImageItem({ post, onClick }: { post: Post, onClick: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div 
        className="relative aspect-[4/3] bg-gray-100 cursor-pointer"
        onClick={onClick}
      >
        <img 
          src={post.imagePath} 
          alt={post.title} 
          className="absolute h-full w-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1">{post.title}</h3>
        {post.description && (
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {formatDate(post.createdAt)}
          </span>
          <LikeDislikeButton post={post} compact={true} />
        </div>
      </div>
    </div>
  );
}

// Modal Component
function Modal({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-lg overflow-hidden shadow-xl max-w-5xl max-h-screen">
        <button
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md z-10"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

// Image Detail Modal
function ImageDetailModal({ post, isOpen, onClose }: { post: Post, isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <div className="w-full max-h-[70vh] bg-gray-100 overflow-hidden">
          <img 
            src={post.imagePath} 
            alt={post.title} 
            className="w-full h-full object-contain max-h-[70vh]" 
          />
        </div>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h2>
          {post.description && (
            <p className="text-gray-600 mb-4">{post.description}</p>
          )}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              Shared {formatDate(post.createdAt)}
            </span>
            <LikeDislikeButton post={post} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Main Gallery App Component
function ImageGalleryApp({ 
  initialView = 'gallery', 
  onViewChange 
}: { 
  initialView: 'gallery' | 'upload', 
  onViewChange: (view: 'gallery' | 'upload') => void 
}) {
  const [view, setView] = useState<'gallery' | 'upload'>(initialView);
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: NotificationType } | null>(null);
  
  // Sync the local view state with the parent's view state
  useEffect(() => {
    setView(initialView);
  }, [initialView]);
  
  // Sync parent component when local state changes
  useEffect(() => {
    onViewChange(view);
  }, [view, onViewChange]);
  
  // Fetch posts
  const { data: posts, isLoading, isError } = useQuery<Post[]>({
    queryKey: ['/api/posts', sortOption],
    queryFn: async ({ queryKey }) => {
      const [_, sort] = queryKey;
      const response = await fetch(`/api/posts?sort=${sort}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return response.json();
    }
  });
  
  // Show notification
  const showNotification = (message: string, type: NotificationType = 'success') => {
    setNotification({ message, type });
  };
  
  // Clear notification
  const clearNotification = () => {
    setNotification(null);
  };
  
  // Open image in modal
  const openImageModal = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };
  
  // Handle upload success
  const handleUploadSuccess = (message: string) => {
    showNotification(message, 'success');
    setView('gallery');
  };
  
  return (
    <>
      {/* View Toggle */}
      <div className="flex mb-6 justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {view === 'gallery' ? 'Community Images' : 'Share an Image'}
          </h1>
        </div>
        <div className="flex gap-2">
          {view === 'gallery' && (
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-1 text-sm"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          )}
          <button
            className="px-4 py-1 border border-gray-300 rounded-md hover:bg-gray-100 text-sm text-gray-700"
            onClick={() => setView(view === 'gallery' ? 'upload' : 'gallery')}
          >
            {view === 'gallery' ? 'Upload Image' : 'View Gallery'}
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      {view === 'upload' ? (
        <ImageUpload onSuccess={handleUploadSuccess} />
      ) : (
        <>
          {/* Gallery View */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-red-500">Error loading images. Please try again later.</p>
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <ImageItem 
                  key={post.id} 
                  post={post} 
                  onClick={() => openImageModal(post)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">No images have been uploaded yet.</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                onClick={() => setView('upload')}
              >
                Upload the First Image
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Image Detail Modal */}
      {selectedPost && (
        <ImageDetailModal
          post={selectedPost}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}
    </>
  );
}

export default App;