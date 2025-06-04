import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../lib/db';
import Cart from '../../../models/Cart';

// Constants
const MAX_CART_ITEMS = 25;

// Helper function to transform cart items for frontend
const transformCartItems = (items: any[]) => {
  return items.map(item => ({
    ...item.toObject(),
    id: item._id.toString()
  }));
};

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    return NextResponse.json({
      items: transformCartItems(cart.items),
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseData = await request.json();
    
    await connectDB();
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.courseId === courseData.id
    );
    
    if (existingItemIndex > -1) {
      return NextResponse.json({ error: 'Item already in cart' }, { status: 400 });
    }

    // Check maximum cart items limit
    if (cart.items.length >= MAX_CART_ITEMS) {
      return NextResponse.json({ error: 'Cart limit exceeded' }, { status: 400 });
    }

    // Add new item to cart
    const cartItem = {
      courseId: courseData.id,
      title: courseData.title,
      description: courseData.description,
      price: courseData.price,
      originalPrice: courseData.originalPrice,
      thumbnail: courseData.thumbnail,
      instructor: courseData.instructor,
      rating: courseData.rating,
      reviews: courseData.reviews,
      students: courseData.students,
      category: courseData.category,
      level: courseData.level,
      duration: courseData.duration,
      lastUpdated: courseData.lastUpdated,
      features: courseData.features || [],
      requirements: courseData.requirements || [],
      whatYouWillLearn: courseData.whatYouWillLearn || [],
      curriculum: courseData.curriculum || [],
      addedAt: new Date()
    };

    cart.items.push(cartItem);
    await cart.save();

    return NextResponse.json({
      message: 'Item added to cart',
      items: transformCartItems(cart.items),
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cart - Clear entire cart
export async function DELETE() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    await Cart.findOneAndUpdate(
      { userId },
      { items: [], totalItems: 0, totalAmount: 0, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 