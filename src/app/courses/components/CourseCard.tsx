import { FiStar, FiClock, FiUsers } from 'react-icons/fi';
import Link from 'next/link';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} className="block">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Course Thumbnail */}
        <div className="aspect-video relative">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium">
              View Course
            </span>
          </div>
        </div>

        {/* Course Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-800 mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Instructor */}
          <div className="flex items-center mb-4">
            <img
              src={course.instructor.image}
              alt={course.instructor.name}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="text-sm font-medium text-gray-900">{course.instructor.name}</span>
          </div>

          {/* Course Stats */}
          <div className="flex items-center justify-between text-sm text-gray-800">
            <div className="flex items-center">
              <FiStar className="text-yellow-500 mr-1" />
              <span className="font-medium">{course.rating.toFixed(1)}</span>
              <span className="mx-1 text-gray-600">•</span>
              <span>{course.reviews.toLocaleString()} reviews</span>
            </div>
            <div className="flex items-center">
              <FiUsers className="mr-1" />
              <span>{course.students.toLocaleString()} students</span>
            </div>
          </div>

          {/* Course Meta */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-800">
              <FiClock className="mr-1" />
              <span>{course.duration}</span>
            </div>
            <div className="text-sm">
              {course.originalPrice ? (
                <div className="flex items-center">
                  <span className="text-gray-900 font-bold">${course.price}</span>
                  <span className="text-gray-600 line-through ml-2">${course.originalPrice}</span>
                </div>
              ) : (
                <span className="text-gray-900 font-bold">${course.price}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 