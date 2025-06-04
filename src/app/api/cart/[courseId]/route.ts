import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../../lib/db';
import Cart from '../../../../models/Cart';

// Helper function to transform cart items for frontend
const transformCartItems = (items: any[]) => {
  return items.map(item => ({
    ...item.toObject(),
    id: item._id.toString()
  }));
};

// DELETE /api/cart/[courseId] - Remove specific item from cart
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
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    // Remove item from cart
    cart.items = cart.items.filter((item: any) => item.courseId !== courseId);
    await cart.save();

    return NextResponse.json({
      message: 'Item removed from cart',
      items: transformCartItems(cart.items),
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 