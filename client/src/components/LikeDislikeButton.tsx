import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Post } from '@/lib/types';

interface LikeDislikeButtonProps {
  post: Post;
  variant?: 'default' | 'compact';
  className?: string;
}

export default function LikeDislikeButton({ post, variant = 'default', className }: LikeDislikeButtonProps) {
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const isCompact = variant === 'compact';
  
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', post.id] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', post.id] });
      setIsDisliked(true);
      setIsLiked(false);
    },
  });
  
  const handleLike = () => {
    if (!isLiked) {
      likeMutation.mutate();
    }
  };
  
  const handleDislike = () => {
    if (!isDisliked) {
      dislikeMutation.mutate();
    }
  };
  
  // Determine if we're in a loading state
  const isLoading = likeMutation.isPending || dislikeMutation.isPending;
  
  return (
    <div className={cn('flex gap-2 items-center', className)}>
      <Button
        variant={isLiked ? 'default' : 'outline'}
        size={isCompact ? 'sm' : 'default'} 
        onClick={handleLike}
        disabled={isLoading || isDisliked}
        className={cn(
          isLiked ? 'bg-green-500 hover:bg-green-600 text-white border-transparent' : 'text-gray-600 dark:text-gray-400',
          isCompact && 'px-2 py-1 h-8'
        )}
      >
        <ThumbsUp className={cn('h-4 w-4', isCompact ? 'mr-0' : 'mr-2')} />
        {!isCompact && <span>Like</span>}
        {(isCompact || isLiked) && <span className="ml-1">{post.likes}</span>}
      </Button>
      
      <Button
        variant={isDisliked ? 'default' : 'outline'}
        size={isCompact ? 'sm' : 'default'}
        onClick={handleDislike}
        disabled={isLoading || isLiked}
        className={cn(
          isDisliked ? 'bg-red-500 hover:bg-red-600 text-white border-transparent' : 'text-gray-600 dark:text-gray-400',
          isCompact && 'px-2 py-1 h-8'
        )}
      >
        <ThumbsDown className={cn('h-4 w-4', isCompact ? 'mr-0' : 'mr-2')} />
        {!isCompact && <span>Dislike</span>}
        {(isCompact || isDisliked) && <span className="ml-1">{post.dislikes}</span>}
      </Button>
    </div>
  );
}