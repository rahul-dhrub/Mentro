export interface CartItem {
  id: string;
  courseId: string;
  title: string;
  instructor: {
    name: string;
    image: string;
  };
  price: number;
  originalPrice?: number;
  thumbnail: string;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface CartContextType {
  cart: Cart;
  addToCart: (course: any) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;
} 