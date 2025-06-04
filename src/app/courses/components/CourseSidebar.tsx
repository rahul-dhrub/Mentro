import { FiCheck } from 'react-icons/fi';
import { Course } from '../types';
import { useRouter } from 'next/navigation';

interface CourseSidebarProps {
  course: Course;
  isStudent?: boolean;
}

export default function CourseSidebar({ course, isStudent = false }: CourseSidebarProps) {
  const router = useRouter();

  const handlePrimaryButtonClick = () => {
    if (isStudent) {
      // TODO: Add to cart functionality
      console.log('Add to cart:', course.id);
    } else {
      // Navigate to course detail page
      router.push(`/course_detail/${course.id}`);
    }
  };

  const handleSecondaryButtonClick = () => {
    if (isStudent) {
      // TODO: Buy now functionality
      console.log('Buy now:', course.id);
    } else {
      // TODO: Edit course functionality
      console.log('Edit course:', course.id);
    }
  };

  return (
    <div className="w-full md:w-80 flex-shrink-0">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          {course.originalPrice && (
            <span className="text-2xl font-bold text-gray-900">${course.price}</span>
          )}
          {course.originalPrice && (
            <span className="text-lg text-gray-700 line-through">${course.originalPrice}</span>
          )}
        </div>
        <button 
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 mb-4"
          onClick={handlePrimaryButtonClick}
        >
          {isStudent ? 'Add to Cart' : 'Go to Course'}
        </button>
        <button 
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 mb-4"
          onClick={handleSecondaryButtonClick}
        >
          {isStudent ? 'Buy Now' : 'Edit Course'}
        </button>
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">This course includes:</h3>
          <ul className="space-y-2">
            {course.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-center text-sm text-gray-700">
                <FiCheck className="text-green-500 mr-2" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Features</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Level</span>
            <span className="font-medium text-gray-900">{course.level}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Duration</span>
            <span className="font-medium text-gray-900">{course.duration}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Category</span>
            <span className="font-medium text-gray-900">{course.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Last Updated</span>
            <span className="font-medium text-gray-900">
              {course.lastUpdated.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 