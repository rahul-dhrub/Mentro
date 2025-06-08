import { useState } from 'react';
import { FiX, FiCalendar, FiClock, FiMapPin, FiUsers, FiFileText, FiVideo } from 'react-icons/fi';
import { AddEventFormData, TaskType, iconMap } from '../types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: AddEventFormData) => void;
  taskTypes: TaskType[];
  selectedDate?: string;
}

export default function AddEventModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  taskTypes, 
  selectedDate 
}: AddEventModalProps) {
  const [formData, setFormData] = useState<AddEventFormData>({
    title: '',
    type: taskTypes[0]?.id || '',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    attendees: '',
    description: '',
    isOnline: false,
    date: selectedDate || new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Partial<AddEventFormData>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<AddEventFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.type) {
      newErrors.type = 'Task type is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      type: taskTypes[0]?.id || '',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      attendees: '',
      description: '',
      isOnline: false,
      date: selectedDate || new Date().toISOString().split('T')[0]
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof AddEventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const timeOptions = [];
  for (let hour = 6; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  const selectedTaskType = taskTypes.find(type => type.id === formData.type);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal */}
        <div className="relative z-10 inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Add New Event</h3>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiFileText className="inline mr-2" size={16} />
                Event Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-500 bg-red-50' : 'border-gray-400 bg-white hover:border-gray-500'
                }`}
                placeholder="Enter event title"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Task Type & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.type ? 'border-red-500 bg-red-50' : 'border-gray-400 hover:border-gray-500'
                  }`}
                >
                  {taskTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline mr-2" size={16} />
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-400 bg-white text-gray-900 rounded-lg hover:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiClock className="inline mr-2" size={16} />
                  Start Time
                </label>
                <select
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.startTime ? 'border-red-500 bg-red-50' : 'border-gray-400 hover:border-gray-500'
                  }`}
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <select
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.endTime ? 'border-red-500 bg-red-50' : 'border-gray-400 hover:border-gray-500'
                  }`}
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
              </div>
            </div>

            {/* Location & Online Toggle */}
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FiMapPin className="inline mr-2" size={16} />
                  Location
                </label>
                <label className="ml-auto flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isOnline}
                    onChange={(e) => handleInputChange('isOnline', e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-400 rounded"
                  />
                  <FiVideo size={16} className={`mr-1 ${formData.isOnline ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className={`text-sm ${formData.isOnline ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                    Online Event
                  </span>
                </label>
              </div>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 bg-white text-gray-900 placeholder-gray-500 rounded-lg hover:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={formData.isOnline ? "Meeting link or platform" : "Room or venue"}
              />
            </div>

            {/* Attendees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiUsers className="inline mr-2" size={16} />
                Number of Attendees (optional)
              </label>
              <input
                type="number"
                value={formData.attendees}
                onChange={(e) => handleInputChange('attendees', e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-400 bg-white text-gray-900 placeholder-gray-500 rounded-lg hover:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter number of attendees"
                min="0"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-400 bg-white text-gray-900 placeholder-gray-500 rounded-lg hover:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter event description"
              />
            </div>

            {/* Preview */}
            {selectedTaskType && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg ${selectedTaskType.color} ${selectedTaskType.borderColor} ${selectedTaskType.textColor}`}>
                  {(() => {
                    const IconComponent = iconMap[selectedTaskType.icon as keyof typeof iconMap];
                    return IconComponent ? <IconComponent size={16} /> : null;
                  })()}
                  <span className="text-sm font-medium">
                    {formData.title || 'Event Title'} ({formData.startTime} - {formData.endTime})
                  </span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Add Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 