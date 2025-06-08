'use client';

interface TabNavigationProps {
  activeTab: 'overview' | 'achievements' | 'courses';
  userRole: 'student' | 'instructor' | 'admin';
  onTabChange: (tab: 'overview' | 'achievements' | 'courses') => void;
}

export default function TabNavigation({ activeTab, userRole, onTabChange }: TabNavigationProps) {
  const tabs = ['overview', 'achievements', ...(userRole === 'instructor' ? ['courses'] : [])] as const;

  return (
    <div className="mb-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab as 'overview' | 'achievements' | 'courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
} 