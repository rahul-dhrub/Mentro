'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal, FiImage, FiSmile, FiFilter, FiX } from 'react-icons/fi';
import { Post, Author, Media, Comment } from '../types';
import MediaPreview from './MediaPreview';
import EmojiPicker from 'emoji-picker-react';
import { uploadImage } from '@/lib/uploadImage';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string, media?: Media[]) => void;
  onShare: (postId: string) => void;
  currentUser: Author;
  onUserSelect?: (userId: string) => void;
}

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

export default function PostCard({ post, onLike, onComment, onShare, currentUser, onUserSelect }: PostCardProps) {
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commentMedia, setCommentMedia] = useState<Media[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [emailFilter, setEmailFilter] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyMedia, setReplyMedia] = useState<Media[]>([]);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showEmojiPicker]);

  // Fetch comments when comments section is opened
  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, emailFilter]);

  const fetchComments = async () => {
    if (!showComments) return;
    
    setIsLoadingComments(true);
    try {
      // Check if the post.id is a valid MongoDB ObjectId (24 hex characters)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(post.id);
      
      if (!isValidObjectId) {
        // For mock data posts, just show empty comments
        setComments([]);
        setIsLoadingComments(false);
        return;
      }
      
      const url = new URL(`/api/posts/${post.id}/comments`, window.location.origin);
      if (emailFilter) {
        url.searchParams.append('email', emailFilter);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handlePostLike = async () => {
    // Simply call the parent's handleLike - it will handle optimistic updates and API calls
    onLike(post.id);
  };

  const handleCommentLike = async (commentId: string) => {
    // Find the comment in our local state
    const findAndUpdateComment = (commentsList: Comment[], targetId: string): Comment[] => {
      return commentsList.map(comment => {
        if (comment.id === targetId) {
          // Toggle the like status optimistically
          const isCurrentlyLiked = comment.isLikedByCurrentUser;
          return {
            ...comment,
            isLikedByCurrentUser: !isCurrentlyLiked,
            likes: isCurrentlyLiked ? comment.likes - 1 : comment.likes + 1
          };
        }
        // Also check nested replies
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: findAndUpdateComment(comment.replies, targetId)
          };
        }
        return comment;
      });
    };

    // Optimistically update the UI immediately
    setComments(prevComments => findAndUpdateComment(prevComments, commentId));

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle comment like');
      }

      const data = await response.json();
      
      // Update with the actual response from server (in case of any discrepancies)
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                likes: data.likesCount,
                isLikedByCurrentUser: data.liked 
              }
            : {
                ...comment,
                replies: comment.replies?.map(reply => 
                  reply.id === commentId 
                    ? { 
                        ...reply, 
                        likes: data.likesCount,
                        isLikedByCurrentUser: data.liked 
                      }
                    : reply
                ) || []
              }
        )
      );
    } catch (error) {
      console.error('Error toggling comment like:', error);
      
      // Revert the optimistic update on error
      setComments(prevComments => findAndUpdateComment(prevComments, commentId));
      
      // Show error message to user
      setError('Failed to update like. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() && commentMedia.length === 0) return;
    
    setError(null);
    setIsSubmitting(true);

    try {
      // Check if the post.id is a valid MongoDB ObjectId (24 hex characters)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(post.id);
      
      if (!isValidObjectId) {
        throw new Error('Cannot comment on mock data. This post uses a test ID.');
      }

      const formData = new FormData();
      formData.append('content', comment.trim());
      
      // Add any temporary images that were uploaded
      const imageFiles = commentMedia
        .filter(media => media.type === 'image' && media.file)
        .map(media => media.file as File);
      
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment');
      }

      // Refresh comments instead of using onComment
      fetchComments();
      setComment('');
      setCommentMedia([]);
    } catch (error) {
      console.error('Error posting comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, parentCommentId: string) => {
    e.preventDefault();
    if (!replyContent.trim() && replyMedia.length === 0) return;
    
    setIsSubmittingReply(true);

    try {
      const formData = new FormData();
      formData.append('content', replyContent.trim());
      
      // Add any temporary images that were uploaded
      const imageFiles = replyMedia
        .filter(media => media.type === 'image' && media.file)
        .map(media => media.file as File);
      
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/comments/${parentCommentId}/reply`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post reply');
      }

      // Refresh comments to show the new reply
      fetchComments();
      setReplyContent('');
      setReplyMedia([]);
      setReplyingTo(null);
    } catch (error) {
      console.error('Error posting reply:', error);
      setError(error instanceof Error ? error.message : 'Failed to post reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReplyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setReplyMedia([...replyMedia, {
        type: 'image',
        file,
        url: URL.createObjectURL(file),
        title: file.name,
        position: replyContent.length
      }]);
    } catch (error) {
      console.error('Error handling reply image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderComment = (comment: Comment, isReply = false, depth = 0) => {
    const authorName = comment.author?.name || 'Unknown User';
    const authorAvatar = comment.author?.avatar || defaultAvatar;
    const authorEmail = comment.author?.email || '';
    const hasReplies = comment.replies && comment.replies.length > 0;
    const showReplies = expandedReplies.has(comment.id);
    
    // Calculate left padding based on nesting depth
    const leftPadding = depth > 0 ? `pl-${Math.min(depth * 8, 32)}` : '';
    const maxDepth = 4; // Limit visual nesting to prevent too much indentation

    const handleCommentUserClick = () => {
      if (onUserSelect && comment.author?.id) {
        onUserSelect(comment.author.id);
      }
    };

    return (
      <div key={comment.id} className={`${depth > 0 ? 'border-l-2 border-gray-100 ml-4' : ''}`}>
        <div className={`flex space-x-3 ${depth > 0 ? 'ml-4 mt-3' : 'mt-4'}`}>
          <div 
            className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleCommentUserClick}
          >
            <Image
              src={authorAvatar}
              alt={authorName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <p 
                  className="text-gray-900 font-medium text-sm cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={handleCommentUserClick}
                >
                  {authorName}
                </p>
                {authorEmail && (
                  <button 
                    onClick={() => toggleEmailFilter(authorEmail)}
                    className="text-xs text-gray-500 hover:text-blue-600 cursor-pointer"
                  >
                    {authorEmail}
                  </button>
                )}
              </div>
              <div className="text-gray-700 text-sm mt-1">
                {comment.content}
                {comment.media?.map((media: Media, mediaIndex: number) => (
                  media.type === 'image' ? (
                    <div key={mediaIndex} className="mt-2">
                      <Image
                        src={media.url || ''}
                        alt="Comment image"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  ) : media.type === 'emoji' ? (
                    <span key={mediaIndex}>{media.code}</span>
                  ) : null
                ))}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-4 mt-2">
              <button 
                onClick={() => handleCommentLike(comment.id)}
                className={`text-sm hover:text-red-600 flex items-center space-x-1 transition-all duration-200 transform hover:scale-105 cursor-pointer ${
                  comment.isLikedByCurrentUser ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                <FiHeart 
                  size={14} 
                  className={`transition-all duration-200 ${
                    comment.isLikedByCurrentUser ? 'fill-current' : ''
                  }`}
                />
                <span>{comment.likes || 0}</span>
              </button>
              
              {depth < maxDepth && (
                <button 
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-gray-500 text-sm hover:text-blue-600 cursor-pointer"
                >
                  Reply
                </button>
              )}
              
              {hasReplies && (
                <button 
                  onClick={() => toggleReplies(comment.id)}
                  className="text-gray-500 text-sm hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
                >
                  <span>{showReplies ? 'Hide' : 'Show'} {comment.repliesCount} {comment.repliesCount === 1 ? 'reply' : 'replies'}</span>
                </button>
              )}
              
              <span className="text-gray-400 text-sm">{comment.timestamp}</span>
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-3 space-y-2 bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${authorName}...`}
                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                    disabled={isSubmittingReply}
                  />
                  <button
                    type="button"
                    onClick={() => replyFileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-blue-600 cursor-pointer"
                    disabled={isSubmittingReply}
                  >
                    <FiImage size={16} />
                  </button>
                  <button
                    type="submit"
                    disabled={(!replyContent.trim() && replyMedia.length === 0) || isSubmittingReply}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm cursor-pointer"
                  >
                    {isSubmittingReply ? 'Posting...' : 'Reply'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                    disabled={isSubmittingReply}
                  >
                    <FiX size={16} />
                  </button>
                </div>
                
                <input
                  ref={replyFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleReplyImageUpload}
                  className="hidden"
                />

                {/* Preview reply images */}
                {replyMedia.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {replyMedia.map((media, index) => (
                      media.type === 'image' ? (
                        <div key={index} className="relative w-12 h-12">
                          <Image
                            src={media.url || ''}
                            alt="Reply image"
                            fill
                            className="object-cover rounded-lg"
                          />
                          <button
                            onClick={() => setReplyMedia(replyMedia.filter((_, i) => i !== index))}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 text-xs cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Show Replies - Always show replies below the parent comment */}
        {hasReplies && showReplies && (
          <div className="mt-2">
            {comment.replies?.map(reply => renderComment(reply, true, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // Instead of uploading immediately, store the file for later upload
      setCommentMedia([...commentMedia, {
        type: 'image',
        file, // Store the file object
        url: URL.createObjectURL(file), // Create a temporary preview URL
        title: file.name,
        position: comment.length
      }]);
    } catch (error) {
      console.error('Error handling image:', error);
      // You might want to show an error message to the user
    } finally {
      setIsUploading(false);
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setCommentMedia([...commentMedia, {
      type: 'emoji',
      code: emojiData.emoji,
      position: comment.length
    }]);
    setComment(comment + emojiData.emoji);
    setShowEmojiPicker(false);
  };
   
  const toggleEmailFilter = (email: string | null) => {
    if (emailFilter === email) {
      setEmailFilter(null); // Clear filter if clicking the same email
    } else {
      setEmailFilter(email); // Set filter to the email
    }
  };

  const handleUserClick = () => {
    if (onUserSelect) {
      onUserSelect(post.author.id);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4 mb-6">
      {/* Author Info */}
      <div className="flex items-center mb-4">
        <div 
          className="relative w-12 h-12 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleUserClick}
        >
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="ml-3">
          <h3 
            className="text-gray-900 font-semibold text-lg cursor-pointer hover:text-blue-600 transition-colors"
            onClick={handleUserClick}
          >
            {post.author.name}
          </h3>
          <p className="text-gray-600 text-sm">{post.author.title} • {post.author.department}</p>
        </div>
        <button className="ml-auto text-gray-400 hover:text-gray-600 cursor-pointer">
          <FiMoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 text-lg whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Media Content */}
      {post.media && post.media.length > 0 && (
        <div className="mb-4 space-y-4">
          {post.media.map((media, index) => (
            <MediaPreview key={index} media={media} />
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Interaction Buttons */}
      <div className="flex items-center space-x-6 border-t border-b border-gray-100 py-3 mb-4">
        <button
          onClick={handlePostLike}
          className={`flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 cursor-pointer ${
            post.isLikedByCurrentUser ? 'text-red-500' : 'text-gray-500'
          } hover:text-red-600`}
        >
          <FiHeart 
            size={20} 
            className={`transition-all duration-200 ${
              post.isLikedByCurrentUser ? 'fill-current' : ''
            }`}
          />
          <span className="font-medium">{post.likes}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 cursor-pointer"
        >
          <FiMessageCircle size={20} />
          <span className="font-medium">{post.comments?.length || 0}</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 cursor-pointer">
          <FiShare2 size={20} />
          <span className="font-medium">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4">
          {/* Email filtering */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-700 font-medium">Comments</h3>
            <div className="flex items-center">
              {emailFilter && (
                <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2">
                  <span>Showing only: {emailFilter}</span>
                  <button 
                    onClick={() => setEmailFilter(null)}
                    className="ml-2 text-blue-800 hover:text-blue-600 cursor-pointer"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}
              <button 
                onClick={() => toggleEmailFilter(currentUser.email || null)}
                className={`flex items-center space-x-1 cursor-pointer ${emailFilter === currentUser.email ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600`}
              >
                <FiFilter size={16} />
                <span className="text-sm">My Comments</span>
              </button>
            </div>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-2 relative">
            {error && (
              <div className="text-red-500 text-sm mb-2">
                {error}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-blue-600 cursor-pointer"
                disabled={isUploading || isSubmitting}
              >
                <FiImage size={20} />
              </button>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 hover:text-blue-600 cursor-pointer"
                disabled={isSubmitting}
              >
                <FiSmile size={20} />
              </button>
              <button
                type="submit"
                disabled={(!comment.trim() && commentMedia.length === 0) || isUploading || isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium cursor-pointer"
              >
                {isSubmitting ? 'Posting...' : isUploading ? 'Uploading...' : 'Comment'}
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute z-100 bottom-full mb-2 right-0">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}

            {/* Preview uploaded images */}
            {commentMedia.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {commentMedia.map((media, index) => (
                  media.type === 'image' ? (
                    <div key={index} className="relative w-16 h-16">
                      <Image
                        src={media.url || ''}
                        alt="Comment image"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setCommentMedia(commentMedia.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ) : null
                ))}
              </div>
            )}
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {isLoadingComments ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment, index) => renderComment(comment, false, 0))
            ) : (
              <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 