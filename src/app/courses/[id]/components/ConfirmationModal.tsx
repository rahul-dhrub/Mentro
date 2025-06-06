import React, { useState, useEffect } from 'react';
import { FiX, FiAlertTriangle } from 'react-icons/fi';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  courseTitle: string;
  actionType: 'publish' | 'unpublish' | 'delete';
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  courseTitle,
  actionType,
  isLoading = false
}: ConfirmationModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const isMatch = inputValue.trim() === courseTitle.trim();
  const canConfirm = isMatch && !isLoading;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setError('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!isMatch) {
      setError('Course title does not match. Please type the exact course title.');
      return;
    }
    setError('');
    onConfirm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (error) setError('');
  };

  const getActionColor = () => {
    switch (actionType) {
      case 'delete':
        return 'red';
      case 'unpublish':
        return 'yellow';
      case 'publish':
        return 'green';
      default:
        return 'blue';
    }
  };

  const actionColor = getActionColor();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="border-b p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              actionColor === 'red' ? 'bg-red-100' :
              actionColor === 'yellow' ? 'bg-yellow-100' :
              actionColor === 'green' ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              <FiAlertTriangle className={`w-5 h-5 ${
                actionColor === 'red' ? 'text-red-600' :
                actionColor === 'yellow' ? 'text-yellow-600' :
                actionColor === 'green' ? 'text-green-600' : 'text-blue-600'
              }`} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            disabled={isLoading}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">{message}</p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-semibold">"{courseTitle}"</span> to confirm:
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:outline-none text-gray-900 placeholder-gray-500 ${
                error 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Type course title here..."
              disabled={isLoading}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors cursor-pointer"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`flex-1 px-4 py-2 font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                !canConfirm
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : actionColor === 'red'
                    ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                    : actionColor === 'yellow'
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700 cursor-pointer'
                      : actionColor === 'green'
                        ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                        : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  {actionType === 'delete' ? 'Deleting...' : 
                   actionType === 'unpublish' ? 'Unpublishing...' : 'Publishing...'}
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 