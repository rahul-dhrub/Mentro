import { NextRequest, NextResponse } from 'next/server';
import { clearCollections } from '@/lib/clearCollections';

// POST /api/clear-collections - Clear assignment and quiz collections
export async function POST(request: NextRequest) {
  try {
    await clearCollections();
    
    return NextResponse.json({
      success: true,
      message: 'Collections cleared successfully. New collections will be created with string-based schema.'
    });
  } catch (error) {
    console.error('Error clearing collections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear collections' },
      { status: 500 }
    );
  }
} 