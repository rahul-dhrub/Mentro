import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface ScheduleHeaderProps {
  onAddEvent: () => void;
}

export default function ScheduleHeader({ onAddEvent }: ScheduleHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
            <p className="text-gray-600 mt-1">Manage your events and appointments</p>
          </div>
        </div>
        <button
          onClick={onAddEvent}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={18} />
          <span>Add Event</span>
        </button>
      </div>
    </div>
  );
} 