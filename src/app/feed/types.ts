export interface Author {
  id: string;
  name: string;
  title?: string;
  department?: string;
  avatar: string;
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
}

export interface Comment {
  id: string;
  author: Author;
  content: string;
  media?: Media[];
  timestamp: string;
  likes: number;
}

export interface Post {
  id: string;
  author: Author;
  content: string;
  media?: Media[];
  likes: number;
  comments: Comment[];
  timestamp: string;
  tags?: string[];
} 