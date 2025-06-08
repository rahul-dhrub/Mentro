'use client';

import { FiEdit2 } from 'react-icons/fi';

interface ExpertiseSectionProps {
  expertise: string[];
  isEditing: boolean;
  onToggleEdit: () => void;
  onExpertiseChange: (expertise: string[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ExpertiseSection({
  expertise,
  isEditing,
  onToggleEdit,
  onExpertiseChange,
  onSave,
  onCancel
}: ExpertiseSectionProps) {
  const handleRemoveSkill = (index: number) => {
    const newExpertise = expertise.filter((_, i) => i !== index);
    onExpertiseChange(newExpertise);
  };

  const handleAddSkill = (skill: string) => {
    if (skill.trim() && !expertise.includes(skill.trim())) {
      onExpertiseChange([...expertise, skill.trim()]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Expertise</h2>
        <button
          onClick={onToggleEdit}
          className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <FiEdit2 size={16} />
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {expertise.map((skill, index) => (
              <div key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add new skill..."
              className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
              onKeyPress={(e) => {
                const target = e.target as HTMLInputElement;
                if (e.key === 'Enter' && target.value.trim()) {
                  handleAddSkill(target.value);
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
        <div className="flex flex-wrap gap-2">
          {expertise.length > 0 ? (
            expertise.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-gray-500 italic">No expertise added yet. Click Edit to add your skills.</p>
          )}
        </div>
      )}
    </div>
  );
} 