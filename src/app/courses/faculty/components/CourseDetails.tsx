'use client';

import { FiPlus, FiEdit2, FiTrash2, FiClock, FiBarChart2, FiVideo, FiDownload, FiUpload, FiUsers, FiCalendar } from 'react-icons/fi';
import { Course, Assignment, Recording, LiveClass } from '../types';

interface CourseDetailsProps {
  course: Course;
  assignments: Assignment[];
  recordings: Recording[];
  liveClasses: LiveClass[];
  onAddAssignment: () => void;
  onEditAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (assignment: Assignment) => void;
  onAddRecording: () => void;
  onEditRecording: (recording: Recording) => void;
  onDeleteRecording: (recording: Recording) => void;
  onAddLiveClass: () => void;
  onEditLiveClass: (liveClass: LiveClass) => void;
  onDeleteLiveClass: (liveClass: LiveClass) => void;
  onJoinLiveClass: (liveClass: LiveClass) => void;
}

export default function CourseDetails({
  course,
  assignments,
  recordings,
  liveClasses,
  onAddAssignment,
  onEditAssignment,
  onDeleteAssignment,
  onAddRecording,
  onEditRecording,
  onDeleteRecording,
  onAddLiveClass,
  onEditLiveClass,
  onDeleteLiveClass,
  onJoinLiveClass
}: CourseDetailsProps) {
  const getStatusColor = (status: LiveClass['status']) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Live Classes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Live Classes</h2>
          <button
            onClick={onAddLiveClass}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus className="mr-2" />
            Schedule Class
          </button>
        </div>
        <div className="bg-white rounded-lg shadow">
          {liveClasses.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {liveClasses.map((liveClass) => (
                <div key={liveClass.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{liveClass.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(liveClass.status)}`}>
                          {liveClass.status.charAt(0).toUpperCase() + liveClass.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiCalendar className="mr-1" />
                          {liveClass.date.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <FiClock className="mr-1" />
                          {liveClass.time} ({liveClass.duration})
                        </div>
                        <div className="flex items-center">
                          <FiUsers className="mr-1" />
                          {liveClass.participants}/{liveClass.maxParticipants} participants
                        </div>
                        <div className="flex items-center">
                          <FiVideo className="mr-1" />
                          {liveClass.room}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {liveClass.status === 'scheduled' && (
                        <button
                          onClick={() => onJoinLiveClass(liveClass)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Join
                        </button>
                      )}
                      {liveClass.status === 'ended' && liveClass.recordingUrl && (
                        <button
                          onClick={() => window.open(liveClass.recordingUrl, '_blank')}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Watch Recording
                        </button>
                      )}
                      <button
                        onClick={() => onEditLiveClass(liveClass)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDeleteLiveClass(liveClass)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No live classes scheduled
            </div>
          )}
        </div>
      </div>

      {/* Assignments Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
          <button
            onClick={onAddAssignment}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus className="mr-2" />
            Add Assignment
          </button>
        </div>
        <div className="bg-white rounded-lg shadow">
          {assignments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiClock className="mr-1" />
                          Due: {assignment.dueDate.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <FiBarChart2 className="mr-1" />
                          {assignment.submissions}/{assignment.totalStudents} submissions
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditAssignment(assignment)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDeleteAssignment(assignment)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No assignments yet
            </div>
          )}
        </div>
      </div>

      {/* Recordings Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Class Recordings</h2>
          <button
            onClick={onAddRecording}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus className="mr-2" />
            Upload Recording
          </button>
        </div>
        <div className="bg-white rounded-lg shadow">
          {recordings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recordings.map((recording) => (
                <div key={recording.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{recording.title}</h3>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiClock className="mr-1" />
                          {recording.date.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <FiVideo className="mr-1" />
                          {recording.duration}
                        </div>
                        <div className="flex items-center">
                          <FiBarChart2 className="mr-1" />
                          {recording.views} views
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditRecording(recording)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDeleteRecording(recording)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <FiTrash2 size={18} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-blue-600">
                        <FiDownload size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No recordings available
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 