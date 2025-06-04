import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../lib/db';
import Wishlist from '../../../models/Wishlist';

// Constants
const MAX_WISHLIST_ITEMS = 50;

// Helper function to transform wishlist items for frontend
const transformWishlistItems = (items: any[]) => {
  return items.map(item => ({
    ...item.toObject(),
    id: item._id.toString()
  }));
};

// GET /api/wishlist - Get user's wishlist
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      // Create empty wishlist if it doesn't exist
      wishlist = new Wishlist({ userId, items: [] });
      await wishlist.save();
    }

    return NextResponse.json({
      items: transformWishlistItems(wishlist.items),
      totalItems: wishlist.totalItems
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/wishlist - Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseData = await request.json();
    
    await connectDB();
    
    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    // Check if item already exists in wishlist
    const existingItemIndex = wishlist.items.findIndex(
      (item: any) => item.courseId === courseData.id
    );
    
    if (existingItemIndex > -1) {
      return NextResponse.json({ error: 'Item already in wishlist' }, { status: 400 });
    }

    // Check maximum wishlist items limit
    if (wishlist.items.length >= MAX_WISHLIST_ITEMS) {
      return NextResponse.json({ error: 'Wishlist limit exceeded' }, { status: 400 });
    }

    // Add new item to wishlist
    const wishlistItem = {
      courseId: courseData.id,
      title: courseData.title,
      description: courseData.description,
      price: courseData.price,
      originalPrice: courseData.originalPrice,
      thumbnail: courseData.thumbnail,
      instructor: {
        name: courseData.instructor?.name || '',
        avatar: courseData.instructor?.image || courseData.instructor?.avatar || ''
      },
      rating: courseData.rating,
      studentsCount: courseData.students || courseData.studentsCount,
      category: courseData.category,
      level: courseData.level,
      duration: courseData.duration,
      addedAt: new Date()
    };

    wishlist.items.push(wishlistItem);
    await wishlist.save();

    return NextResponse.json({
      message: 'Item added to wishlist',
      items: transformWishlistItems(wishlist.items),
      totalItems: wishlist.totalItems
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/wishlist - Clear entire wishlist
export async function DELETE() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    await Wishlist.findOneAndUpdate(
      { userId },
      { items: [], totalItems: 0, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 