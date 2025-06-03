import React from 'react';
import { FiUser, FiEdit2 } from 'react-icons/fi';
import { Submission, Assignment } from '../../../../types/assignment';

interface SubmissionsListProps {
  submissions: Submission[];
  assignment: Assignment;
  onSubmissionClick: (submission: Submission) => void;
  onEditSubmission: (submission: Submission) => void;
}

const SubmissionsList: React.FC<SubmissionsListProps> = ({
  submissions,
  assignment,
  onSubmissionClick,
  onEditSubmission
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Submissions ({submissions.length})
        </h2>
        <div className="text-sm text-gray-500">
          Total submissions: {submissions.length}
        </div>
      </div>

      {submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((submission, index) => (
            <div
              key={submission.id || `submission-${index}`}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onSubmissionClick(submission)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {submission.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {submission.userName}
                    </h4>
                    <p className="text-xs text-gray-500">{submission.userEmail}</p>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      submission.status === 'submitted'
                        ? 'bg-blue-100 text-blue-800'
                        : submission.status === 'graded'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {submission.status.toUpperCase()}
                  </span>
                  {submission.grade !== undefined && (
                    <span className="text-sm font-medium text-gray-900">
                      {submission.grade}/{assignment.totalMarks}
                    </span>
                  )}
                  {/* Edit button - only show for current user's submission */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSubmission(submission);
                    }}
                    className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                    title="Edit submission"
                  >
                    <FiEdit2 size={14} />
                  </button>
                </div>
              </div>

              {/* Quick Preview Info */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{submission.attachments.length} files attached</span>
                  <span>Click to view details and grade</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FiUser size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No submissions yet</p>
          <p className="text-sm">Submissions will appear here once students submit their work.</p>
        </div>
      )}
    </div>
  );
};

export default SubmissionsList; 