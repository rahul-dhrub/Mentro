import Image from 'next/image';
import { FiUsers, FiStar } from 'react-icons/fi';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  students: number;
  rating: number;
  price: number;
  category: string;
}

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 text-gray-900">{course.title}</h3>
        <p className="text-gray-800 mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between">
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
      </div>
    </div>
  );
} 