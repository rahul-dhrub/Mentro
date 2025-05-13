'use client';

interface HeroSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function HeroSection({ activeTab, setActiveTab }: HeroSectionProps) {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Transform Education, Connect Globally
          </h1>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Join our global learning community where tutors create custom curricula and learners
            discover personalized educational experiences.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab('learners')}
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Learning
            </button>
            <button
              onClick={() => setActiveTab('tutors')}
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Start Tutoring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 