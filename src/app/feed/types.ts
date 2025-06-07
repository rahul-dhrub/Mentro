export interface Author {
  id: string;
  name: string;
  email?: string;
  title?: string;
  department?: string;
  avatar: string;
  followers?: number;
  following?: number;
  bio?: string;
  posts?: number;
}

export type MediaType = 'image' | 'video' | 'pdf' | 'document' | 'emoji';

export interface Media {
  type: MediaType;
  url?: string;
  thumbnail?: string;
  title?: string;
  size?: string;
  duration?: string;
  pageCount?: number;
  code?: string; // For emojis
  position?: number; // Position in the content
  file?: File; // For temporary file storage before upload
}

export interface Comment {
  id: string;
  author: Author;
  content: string;
  media?: Media[];
  timestamp: string;
  likes: number;
  likedBy?: string[]; // User IDs who liked this comment
  isLikedByCurrentUser?: boolean; // For UI state
  parentCommentId?: string; // For replies
  replies?: Comment[]; // Nested replies
  repliesCount?: number; // Number of replies
}

export interface Post {
  id: string;
  author: Author;
  content: string;
  media?: Media[];
  likes: number;
  likedBy?: string[]; // User IDs who liked this post
  isLikedByCurrentUser?: boolean; // For UI state
  comments: Comment[];
  timestamp: string;
  tags?: string[];
}

export interface Publication {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  journal?: string;
  year?: number;
  authors?: string[];
  citationCount?: number;
  abstract?: string;
}

export interface SearchResult {
  type: 'user' | 'hashtag';
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  department?: string;
  followers?: number;
  posts?: number;
  description?: string;
  category?: string;
  rating?: number;
  reviews?: number;
}

export interface UserProfile extends Author {
  userPosts: Post[];
  publications?: Publication[];
  courses?: Course[];
  blogs?: Blog[];
  isFollowing?: boolean;
  averageRating?: number;
  totalReviews?: number;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  students: number;
  progress: number;
}

export interface Blog {
  id: string;
  _id?: string; // MongoDB document ID
  title: string;
  content: string;
  coverImage: string;
  excerpt: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  tags: string[];
  readTime: number;
} 