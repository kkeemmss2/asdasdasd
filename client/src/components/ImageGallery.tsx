import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Post, SortOption } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import ImageModal from "./ImageModal";
import LikeDislikeButton from "./LikeDislikeButton";

export default function ImageGallery() {
  const [currentSort, setCurrentSort] = useState<SortOption>("latest");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: posts, isLoading, isError } = useQuery<Post[]>({
    queryKey: ["/api/posts", currentSort],
    queryFn: async ({ queryKey }) => {
      const [_, sort] = queryKey;
      const response = await fetch(`/api/posts?sort=${sort}`);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    }
  });

  const handleSortChange = (value: string) => {
    setCurrentSort(value as SortOption);
  };

  const openImageModal = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Filter Bar */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Community Gallery</h2>
        <div className="flex space-x-2">
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gallery */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="py-16 text-center">
          <p className="text-red-500">Error loading images. Please try again later.</p>
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {posts.map((post) => (
            <Card 
              key={post.id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative pb-[66.67%] bg-gray-100 dark:bg-gray-900">
                <img 
                  src={post.imagePath}
                  alt={post.title}
                  className="absolute h-full w-full object-cover cursor-pointer"
                  onClick={() => openImageModal(post)}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{post.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">{post.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Shared {formatDate(post.createdAt)}
                  </div>
                  <LikeDislikeButton post={post} variant="compact" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400">No images have been shared yet. Be the first!</p>
        </div>
      )}

      {/* Load More Button (shown when more than 6 posts and not all loaded) */}
      {posts && posts.length > 0 && (
        <div className="flex justify-center mb-12">
          <Button 
            variant="outline"
            className="px-6 py-2"
            // This would normally connect to a pagination system
            // For now, it's just for UI consistency with the design
            onClick={() => {}}
          >
            Load More
          </Button>
        </div>
      )}

      {/* Image Modal */}
      {selectedPost && (
        <ImageModal
          post={selectedPost}
          isOpen={isModalOpen}
          onClose={closeImageModal}
        />
      )}
    </>
  );
}
