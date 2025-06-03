import connectDB from './db';
import mongoose from 'mongoose';

export async function clearCollections() {
  try {
    await connectDB();
    
    console.log('Clearing Assignment and Quiz collections...');
    
    // Drop the collections if they exist
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    // Check if collections exist and drop them
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (collectionNames.includes('assignments')) {
      await db.collection('assignments').drop();
      console.log('Dropped assignments collection');
    }
    
    if (collectionNames.includes('quizzes')) {
      await db.collection('quizzes').drop();
      console.log('Dropped quizzes collection');
    }
    
    console.log('Collections cleared successfully. New collections will be created with string-based schema.');
    
  } catch (error) {
    console.error('Error clearing collections:', error);
  }
}

// Run this script if called directly
if (require.main === module) {
  clearCollections().then(() => {
    console.log('Script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
} 