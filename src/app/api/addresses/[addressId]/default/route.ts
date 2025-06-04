import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../../../lib/db';
import Address from '../../../../../models/Address';

// PUT /api/addresses/[addressId]/default - Set address as default
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { addressId } = await params;

    await connectDB();
    
    const address = await Address.findOne({ _id: addressId, userId });
    
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Set this address as default
    address.isDefault = true;
    await address.save(); // The pre-save hook will handle removing default from other addresses

    return NextResponse.json({
      message: 'Address set as default successfully'
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 