'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal } from 'react-icons/fi';
import { Post, Author } from '../types';
import MediaPreview from './MediaPreview';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string) => void;
  currentUser: Author;
}

export default function PostCard({ post, onLike, onComment, onShare, currentUser }: PostCardProps) {
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onComment(post.id, comment.trim());
    setComment('');
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4 mb-6">
      {/* Author Info */}
      <div className="flex items-center mb-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-gray-900 font-semibold text-lg">{post.author.name}</h3>
          <p className="text-gray-600 text-sm">{post.author.title} • {post.author.department}</p>
        </div>
        <button className="ml-auto text-gray-400 hover:text-gray-600">
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
          onClick={() => onLike(post.id)}
          className={`flex items-center space-x-2 ${
            post.likes > 0 ? 'text-red-500' : 'text-gray-500'
          } hover:text-red-600`}
        >
          <FiHeart size={20} />
          <span className="font-medium">{post.likes}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-500 hover:text-blue-600"
        >
          <FiMessageCircle size={20} />
          <span className="font-medium">{post.comments.length}</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600">
          <FiShare2 size={20} />
          <span className="font-medium">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4">
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Comment
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {post.comments.map((comment, index) => (
              <div key={index} className="flex space-x-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-900 font-medium text-sm">{comment.author.name}</p>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <button className="text-gray-500 text-sm hover:text-blue-600">Like</button>
                    <button className="text-gray-500 text-sm hover:text-blue-600">Reply</button>
                    <span className="text-gray-400 text-sm">{comment.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 