export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    image: string;
    rating: number;
    reviews: number;
  };
  rating: number;
  reviews: number;
  students: number;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lastUpdated: Date;
  features: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  curriculum: {
    title: string;
    lectures: number;
    duration: string;
    sections: {
      title: string;
      lectures: {
        title: string;
        duration: string;
        type: 'video' | 'reading' | 'quiz' | 'assignment';
        preview?: boolean;
      }[];
    }[];
  }[];
}

export interface CourseFilter {
  category?: string;
  level?: Course['level'];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  duration?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  courseCount: number;
} 