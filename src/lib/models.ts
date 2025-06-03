// Central model registry to ensure all models are loaded in the correct order
import Lesson from '@/models/Lesson';
import Chapter from '@/models/Chapter';
import Assignment from '@/models/Assignment';
import Quiz from '@/models/Quiz';

// Export all models to ensure they're registered
export {
  Lesson,
  Chapter,
  Assignment,
  Quiz
};

// Function to ensure all models are registered
export function ensureModelsRegistered() {
  // Access each model to ensure they're registered with Mongoose
  return {
    Lesson,
    Chapter,
    Assignment,
    Quiz
  };
} 