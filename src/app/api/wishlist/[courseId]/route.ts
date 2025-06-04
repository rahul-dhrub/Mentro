import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../../lib/db';
import Wishlist from '../../../../models/Wishlist';

// Helper function to transform wishlist items for frontend
const transformWishlistItems = (items: any[]) => {
  return items.map(item => ({
    ...item.toObject(),
    id: item.courseId // Use courseId as the id for frontend
  }));
};

// DELETE /api/wishlist/[courseId] - Remove specific item from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;

    await connectDB();
    
    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    // Remove item from wishlist by courseId
    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter((item: any) => item.courseId !== courseId);
    
    // Check if an item was actually removed
    if (wishlist.items.length === initialLength) {
      return NextResponse.json({ error: 'Item not found in wishlist' }, { status: 404 });
    }
    
    await wishlist.save();

    return NextResponse.json({
      message: 'Item removed from wishlist',
      items: transformWishlistItems(wishlist.items),
      totalItems: wishlist.totalItems
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 