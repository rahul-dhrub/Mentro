import Image from 'next/image';
import { FiUsers, FiStar, FiClock } from 'react-icons/fi';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  students: number;
  rating: number;
  price: number;
  category: string;
  progress?: number;
  lastAccessed?: string;
}

interface StudentCourseCardProps {
  course: Course;
}

export default function StudentCourseCard({ course }: StudentCourseCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover"
        />
        {course.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 text-gray-900">{course.title}</h3>
        <p className="text-gray-800 mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <FiUsers className="text-gray-700" />
              <span className="text-sm text-gray-800">{course.students}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiStar className="text-yellow-600" />
              <span className="text-sm text-gray-800">{course.rating}</span>
            </div>
          </div>
          <span className="text-lg font-bold text-blue-700">${course.price}</span>
        </div>
        {course.progress !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-700">
              <span className="font-medium">Progress:</span>
              <span>{course.progress}%</span>
            </div>
            {course.lastAccessed && (
              <div className="flex items-center gap-1 text-gray-700">
                <FiClock className="text-gray-500" />
                <span>{course.lastAccessed}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 