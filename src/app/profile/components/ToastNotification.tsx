'use client';

interface ToastNotificationProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

export default function ToastNotification({ message, type, onDismiss }: ToastNotificationProps) {
  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`}>
      <div className="flex items-center gap-2">
        {type === 'success' ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
        <span className="font-medium">{message}</span>
        <button
          onClick={onDismiss}
          className="ml-2 text-white hover:text-gray-200 font-bold text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
} 