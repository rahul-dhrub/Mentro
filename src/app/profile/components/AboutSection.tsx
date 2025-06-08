'use client';

import { FiEdit2 } from 'react-icons/fi';

interface AboutSectionProps {
  bio: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onBioChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  showEditButton?: boolean;
}

export default function AboutSection({
  bio,
  isEditing,
  onToggleEdit,
  onBioChange,
  onSave,
  onCancel,
  showEditButton = true
}: AboutSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">About</h2>
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
          <textarea
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
            placeholder="Write about yourself..."
          />
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 leading-relaxed">
          {bio || "No bio added yet. Click Edit to add information about yourself."}
        </p>
      )}
    </div>
  );
} 