import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../../lib/db';
import Wishlist from '../../../../models/Wishlist';

// Helper function to transform wishlist items for frontend
const transformWishlistItems = (items: any[]) => {
  return items.map(item => ({
    ...item.toObject(),
    id: item._id.toString()
  }));
};

// DELETE /api/wishlist/[courseId] - Remove specific item from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = params;

    await connectDB();
    
    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    // Remove item from wishlist
    wishlist.items = wishlist.items.filter((item: any) => item.courseId !== courseId);
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