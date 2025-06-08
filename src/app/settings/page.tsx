'use client';

import { useState, useEffect } from 'react';
import { FiSettings, FiBell, FiMoon, FiSun, FiCheck, FiX } from 'react-icons/fi';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode, notificationsEnabled, toggleNotifications, updateSettings, isLoading } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [settings, setSettings] = useState({
    darkMode,
    notificationsEnabled,
    emailNotifications: true,
    pushNotifications: true
  });

  // Load additional settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setEmailNotifications(data.settings.emailNotifications);
          setPushNotifications(data.settings.pushNotifications);
          setSettings({
            darkMode: data.settings.darkMode,
            notificationsEnabled: data.settings.notificationsEnabled,
            emailNotifications: data.settings.emailNotifications,
            pushNotifications: data.settings.pushNotifications
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    if (!isLoading) {
      loadSettings();
    }
  }, [isLoading]);

  // Update local settings when context changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      darkMode,
      notificationsEnabled
    }));
  }, [darkMode, notificationsEnabled]);

  // Save settings to database
  const saveSettings = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      await updateSettings({
        darkMode: settings.darkMode,
        notificationsEnabled: settings.notificationsEnabled,
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications
      });
      
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

  const handleNotificationToggle = async () => {
    await toggleNotifications();
  };

  const handleDarkModeToggle = async () => {
    await toggleDarkMode();
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

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading settings...</span>
              </div>
            )}

            {!isLoading && (
              <div>

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
                  disabled={isLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    notificationsEnabled
                      ? 'bg-blue-600 dark:bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
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
                  disabled={isLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    darkMode
                      ? 'bg-purple-600 dark:bg-purple-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Email Notifications Setting */}
            <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FiBell className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => {
                    const newValue = !emailNotifications;
                    setEmailNotifications(newValue);
                    setSettings(prev => ({ ...prev, emailNotifications: newValue }));
                  }}
                  disabled={isLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    emailNotifications
                      ? 'bg-green-600 dark:bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Push Notifications Setting */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <FiBell className="text-yellow-600 dark:text-yellow-400" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Push Notifications
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive push notifications in your browser
                  </p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => {
                    const newValue = !pushNotifications;
                    setPushNotifications(newValue);
                    setSettings(prev => ({ ...prev, pushNotifications: newValue }));
                  }}
                  disabled={isLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                    pushNotifications
                      ? 'bg-yellow-600 dark:bg-yellow-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
              </div>
            )}
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
                disabled={isSaving || isLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isSaving || isLoading
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                }`}
              >
                {isSaving ? 'Saving...' : isLoading ? 'Loading...' : 'Save Changes'}
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