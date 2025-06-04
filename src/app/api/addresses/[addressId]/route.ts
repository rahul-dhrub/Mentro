import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../../lib/db';
import Address from '../../../../models/Address';

// Helper function to transform address items for frontend
const transformAddress = (address: any) => {
  return {
    id: address._id.toString(),
    firstName: address.firstName,
    lastName: address.lastName,
    email: address.email,
    phone: address.phone,
    address: address.address,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    country: address.country,
    label: address.label,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt
  };
};

// GET /api/addresses/[addressId] - Get specific address
export async function GET(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { addressId } = params;

    await connectDB();
    
    const address = await Address.findOne({ _id: addressId, userId });
    
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({
      address: transformAddress(address)
    });
  } catch (error) {
    console.error('Error fetching address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/addresses/[addressId] - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { addressId } = params;
    const updateData = await request.json();

    await connectDB();
    
    const address = await Address.findOne({ _id: addressId, userId });
    
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // Update address fields
    Object.assign(address, {
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      email: updateData.email,
      phone: updateData.phone,
      address: updateData.address,
      city: updateData.city,
      state: updateData.state,
      zipCode: updateData.zipCode,
      country: updateData.country,
      label: updateData.label,
      isDefault: updateData.isDefault
    });

    await address.save();

    return NextResponse.json({
      message: 'Address updated successfully',
      address: transformAddress(address)
    });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/addresses/[addressId] - Delete specific address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { addressId } = params;

    await connectDB();
    
    const address = await Address.findOne({ _id: addressId, userId });
    
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const wasDefault = address.isDefault;
    await Address.deleteOne({ _id: addressId, userId });

    // If deleted address was default, make another address default
    if (wasDefault) {
      const nextAddress = await Address.findOne({ userId }).sort({ createdAt: -1 });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return NextResponse.json({
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 