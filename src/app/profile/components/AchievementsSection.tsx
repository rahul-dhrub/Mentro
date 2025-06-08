'use client';

import { FiEdit2, FiAward } from 'react-icons/fi';

interface AchievementsSectionProps {
  achievements: string[];
  isEditing: boolean;
  onToggleEdit: () => void;
  onAchievementsChange: (achievements: string[]) => void;
  onSave: () => void;
  onCancel: () => void;
  showEditButton?: boolean;
}

export default function AchievementsSection({
  achievements,
  isEditing,
  onToggleEdit,
  onAchievementsChange,
  onSave,
  onCancel,
  showEditButton = true
}: AchievementsSectionProps) {
  const handleUpdateAchievement = (index: number, value: string) => {
    const newAchievements = [...achievements];
    newAchievements[index] = value;
    onAchievementsChange(newAchievements);
  };

  const handleRemoveAchievement = (index: number) => {
    const newAchievements = achievements.filter((_, i) => i !== index);
    onAchievementsChange(newAchievements);
  };

  const handleAddAchievement = (achievement: string) => {
    if (achievement.trim()) {
      onAchievementsChange([...achievements, achievement.trim()]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
        {showEditButton && (
          <button
            onClick={onToggleEdit}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FiEdit2 size={16} />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <FiAward className="text-yellow-500 flex-shrink-0" size={20} />
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => handleUpdateAchievement(index, e.target.value)}
                  className="flex-1 p-2 border-0 focus:ring-0 focus:outline-none bg-transparent text-gray-900 font-medium"
                />
                <button
                  onClick={() => handleRemoveAchievement(index)}
                  className="text-red-600 hover:text-red-800 px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add new achievement..."
              className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
              onKeyPress={(e) => {
                const target = e.target as HTMLInputElement;
                if (e.key === 'Enter' && target.value.trim()) {
                  handleAddAchievement(target.value);
                  target.value = '';
                }
              }}
            />
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.length > 0 ? (
            achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg">
                <FiAward className="text-yellow-500 mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-800">{achievement}</span>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <FiAward className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500 mb-2">No achievements added yet</p>
              {showEditButton && (
                <button
                  onClick={onToggleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Add Achievement
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 