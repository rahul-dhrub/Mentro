import { FiCheck, FiClock, FiUsers } from 'react-icons/fi';
import { Course } from '../types';

interface CourseOverviewProps {
  course: Course;
}

export default function CourseOverview({ course }: CourseOverviewProps) {
  return (
    <div className="mt-6">
      <div className="prose max-w-none">
        <h3 className="text-lg font-medium text-gray-900 mb-4">What you'll learn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {course.whatYouWillLearn.map((item: string, index: number) => (
            <div key={index} className="flex items-start">
              <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span className="text-gray-800">{item}</span>
            </div>
          ))}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
        <ul className="list-disc pl-5 space-y-2">
          {course.requirements.map((req: string, index: number) => (
            <li key={index} className="text-gray-800">{req}</li>
          ))}
        </ul>
      </div>

      {/* Description Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">About This Course</h3>
        <div className="space-y-4 text-gray-700">
          <p>
            This comprehensive course is designed to take you from a beginner to a professional web developer. 
            You'll learn the latest technologies and best practices used in modern web development.
          </p>
          <p>
            The course is structured in a way that builds your skills progressively, starting with the fundamentals 
            and moving towards advanced concepts. Each section includes hands-on projects and real-world examples 
            to reinforce your learning.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-start">
              <FiClock className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Self-Paced Learning</p>
                <p className="text-sm text-gray-600">Learn at your own pace with lifetime access</p>
              </div>
            </div>
            <div className="flex items-start">
              <FiUsers className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Community Support</p>
                <p className="text-sm text-gray-600">Join our active community of learners</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 