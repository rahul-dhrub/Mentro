export interface Message {
  id: string;
  text: string;
  timestamp: string;
  sender: string;
  isOwn: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
  online: boolean;
  isGroup?: boolean;
  email?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  imageUrl: string;
  fullName: string;
} 