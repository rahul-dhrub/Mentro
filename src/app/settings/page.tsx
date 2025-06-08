'use client';

import { useState } from 'react';
import { FiSettings, FiBell, FiMoon, FiSun, FiCheck, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode, notificationsEnabled, toggleNotifications } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  // Save settings to localStorage and apply changes
  const saveSettings = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSaveStatus('success');
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      
      // Clear status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleNotificationToggle = () => {
    toggleNotifications();
  };

  const handleDarkModeToggle = () => {
    toggleDarkMode();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Link href="/feed" className="text-blue-600 hover:text-blue-800 transition-colors">
              ← Back to Feed
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <FiSettings className="text-blue-600" size={32} />
            <span>Settings</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your preferences and application settings
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Preferences
            </h2>

            {/* Notifications Setting */}
            <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FiBell className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive notifications for important updates and messages
                  </p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={handleNotificationToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    notificationsEnabled
                      ? 'bg-blue-600 dark:bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Dark Mode Setting */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  {darkMode ? (
                    <FiMoon className="text-purple-600 dark:text-purple-400" size={20} />
                  ) : (
                    <FiSun className="text-purple-600 dark:text-purple-400" size={20} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Switch between light and dark theme
                  </p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={handleDarkModeToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    darkMode
                      ? 'bg-purple-600 dark:bg-purple-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button Section */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {saveStatus === 'success' && (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <FiCheck size={16} />
                    <span className="text-sm">Settings saved successfully!</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                    <FiX size={16} />
                    <span className="text-sm">Error saving settings. Please try again.</span>
                  </div>
                )}
              </div>
              <button
                onClick={saveSettings}
                disabled={isSaving}
                className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isSaving
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Settings Sections (Placeholder) */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Other Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              More settings options will be added here in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 