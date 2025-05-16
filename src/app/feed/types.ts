export interface Author {
  id: string;
  name: string;
  avatar: string;
  title: string;
  department: string;
}

export interface Comment {
  id: string;
  author: Author;
  content: string;
  timestamp: string;
  likes: number;
}

export type MediaType = 'image' | 'video' | 'pdf' | 'document';

export interface Media {
  type: MediaType;
  url: string;
  thumbnail?: string;
  title?: string;
  size?: string;
  duration?: string; // for videos
  pageCount?: number; // for PDFs
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