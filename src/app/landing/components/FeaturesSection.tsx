'use client';

import { FiFileText, FiCalendar, FiMessageSquare, FiBook, FiGlobe, FiDollarSign } from 'react-icons/fi';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    icon: <FiGlobe className="w-6 h-6" />,
    title: "Global Community",
    description: "Connect with learners and tutors from around the world, breaking geographical barriers to education.",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    icon: <FiBook className="w-6 h-6" />,
    title: "Custom Curriculum",
    description: "Create and share your unique teaching methodology with a curriculum tailored to your expertise.",
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600"
  },
  {
    icon: <FiDollarSign className="w-6 h-6" />,
    title: "Earn While Teaching",
    description: "Monetize your expertise with flexible pricing and multiple revenue streams.",
    bgColor: "bg-green-100",
    iconColor: "text-green-600"
  },
  {
    icon: <FiFileText className="w-6 h-6" />,
    title: "Grading & Feedback",
    description: "Submit assignments, receive grades, and get detailed feedback from instructors.",
    bgColor: "bg-indigo-100",
    iconColor: "text-indigo-600"
  },
  {
    icon: <FiCalendar className="w-6 h-6" />,
    title: "Scheduling",
    description: "Keep track of important dates, classes, and assignment deadlines.",
    bgColor: "bg-pink-100",
    iconColor: "text-pink-600"
  },
  {
    icon: <FiMessageSquare className="w-6 h-6" />,
    title: "Communication",
    description: "Direct messaging, announcements, and discussion forums for class interaction.",
    bgColor: "bg-yellow-100",
    iconColor: "text-yellow-600"
  },
  {
    icon: <FiBook className="w-6 h-6" />,
    title: "Course Management",
    description: "Organize and access course materials, assignments, and resources in one place.",
    bgColor: "bg-red-100",
    iconColor: "text-red-600"
  }
];

export default function FeaturesSection() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
          <p className="text-xl text-gray-600">
            Discover innovative features that transform education
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                <div className={feature.iconColor}>
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 