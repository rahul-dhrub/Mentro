export interface WishlistItem {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  instructor: {
    name: string;
    avatar: string;
  };
  rating: number;
  studentsCount: number;
  duration: string;
  level: string;
  category: string;
  addedAt: Date;
}

export interface Wishlist {
  items: WishlistItem[];
  totalItems: number;
}

export interface WishlistContextType {
  wishlist: Wishlist;
  addToWishlist: (item: Omit<WishlistItem, 'addedAt'>) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (itemId: string) => boolean;
  isLoading: boolean;
  maxItems: number;
} 