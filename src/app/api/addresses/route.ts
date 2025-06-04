import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../lib/db';
import Address from '../../../models/Address';

// Constants
const MAX_ADDRESSES_PER_USER = 10;

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

// GET /api/addresses - Get user's addresses
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const addresses = await Address.find({ userId })
      .sort({ isDefault: -1, createdAt: -1 }); // Default first, then by creation date

    return NextResponse.json({
      addresses: addresses.map(transformAddress)
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addressData = await request.json();
    
    await connectDB();
    
    // Check address limit per user
    const addressCount = await Address.countDocuments({ userId });
    if (addressCount >= MAX_ADDRESSES_PER_USER) {
      return NextResponse.json({ 
        error: `You can only have a maximum of ${MAX_ADDRESSES_PER_USER} saved addresses` 
      }, { status: 400 });
    }

    // If this is the first address, make it default
    const isFirstAddress = addressCount === 0;

    const newAddress = new Address({
      userId,
      firstName: addressData.firstName,
      lastName: addressData.lastName,
      email: addressData.email,
      phone: addressData.phone,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      country: addressData.country,
      label: addressData.label,
      isDefault: addressData.isDefault || isFirstAddress
    });

    await newAddress.save();

    return NextResponse.json({
      message: 'Address created successfully',
      address: transformAddress(newAddress)
    });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/addresses - Clear all addresses (optional)
export async function DELETE() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    await Address.deleteMany({ userId });

    return NextResponse.json({ message: 'All addresses deleted successfully' });
  } catch (error) {
    console.error('Error deleting addresses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 