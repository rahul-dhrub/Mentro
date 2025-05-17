import React from 'react';
import Image from 'next/image';
import { Faculty } from '../../types';

interface FacultyTabProps {
  faculty: Faculty[];
  onAddFaculty: () => void;
  onRemoveFaculty: (facultyId: string) => void;
}

export default function FacultyTab({
  faculty,
  onAddFaculty,
  onRemoveFaculty
}: FacultyTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Course Faculty</h2>
        <button
          onClick={onAddFaculty}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <span>Add Faculty</span>
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {faculty.map((member) => (
            <div key={member.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden">
                    <Image
                      src={member.avatar || 'https://via.placeholder.com/150'}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                      {member.role === 'owner' && (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{member.email}</p>
                    <p className="text-xs text-gray-400">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => onRemoveFaculty(member.id)}
                      className="text-red-600 hover:text-red-900 flex items-center space-x-1 cursor-pointer"
                    >
                      <span className="text-sm">Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 