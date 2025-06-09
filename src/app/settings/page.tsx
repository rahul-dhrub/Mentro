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

  // Force body styles when component mounts or darkMode changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const body = document.body;
      if (darkMode) {
        body.style.backgroundColor = '#0a0a0a';
        body.style.color = '#ededed';
      } else {
        body.style.backgroundColor = '#ffffff';
        body.style.color = '#171717';
      }
    }
  }, [darkMode]);

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

  // Force light/dark styles based on current state
  const containerStyle = darkMode ? {
    backgroundColor: '#111827',
    color: '#f9fafb'
  } : {
    backgroundColor: '#f9fafb',
    color: '#111827'
  };

  const cardStyle = darkMode ? {
    backgroundColor: '#1f2937',
    borderColor: '#374151'
  } : {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb'
  };

  return (
    <div 
      style={containerStyle}
      className="min-h-screen transition-colors duration-200"
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Link 
              href="/feed" 
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Back to Feed
            </Link>
          </div>
          <h1 
            style={{ color: darkMode ? '#ffffff' : '#111827' }}
            className="text-3xl font-bold flex items-center space-x-2"
          >
            <FiSettings className="text-blue-600" size={32} />
            <span>Settings</span>
          </h1>
          <p 
            style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
            className="mt-2"
          >
            Manage your preferences and application settings
          </p>
        </div>

        {/* Settings Card */}
        <div 
          style={cardStyle}
          className="rounded-lg shadow-md border"
        >
          <div className="p-6">
            <h2 
              style={{ color: darkMode ? '#ffffff' : '#111827' }}
              className="text-xl font-semibold mb-6"
            >
              Preferences
            </h2>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span 
                  style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
                  className="ml-2"
                >
                  Loading settings...
                </span>
              </div>
            )}

            {!isLoading && (
              <div>

            {/* Notifications Setting */}
            <div 
              style={{ borderBottomColor: darkMode ? '#374151' : '#e5e7eb' }}
              className="flex items-center justify-between py-4 border-b"
            >
              <div className="flex items-center space-x-3">
                <div 
                  style={{ backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe' }}
                  className="p-2 rounded-lg"
                >
                  <FiBell 
                    style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}
                    size={20} 
                  />
                </div>
                <div>
                  <h3 
                    style={{ color: darkMode ? '#ffffff' : '#111827' }}
                    className="text-lg font-medium"
                  >
                    Notifications
                  </h3>
                  <p 
                    style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
                    className="text-sm"
                  >
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
                      ? 'bg-blue-600'
                      : darkMode ? 'bg-gray-600' : 'bg-gray-200'
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
            <div 
              style={{ borderBottomColor: darkMode ? '#374151' : '#e5e7eb' }}
              className="flex items-center justify-between py-4 border-b"
            >
              <div className="flex items-center space-x-3">
                <div 
                  style={{ backgroundColor: darkMode ? '#581c87' : '#f3e8ff' }}
                  className="p-2 rounded-lg"
                >
                  {darkMode ? (
                    <FiMoon 
                      style={{ color: darkMode ? '#c084fc' : '#7c3aed' }}
                      size={20} 
                    />
                  ) : (
                    <FiSun 
                      style={{ color: darkMode ? '#c084fc' : '#7c3aed' }}
                      size={20} 
                    />
                  )}
                </div>
                <div>
                  <h3 
                    style={{ color: darkMode ? '#ffffff' : '#111827' }}
                    className="text-lg font-medium"
                  >
                    Dark Mode
                  </h3>
                  <p 
                    style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
                    className="text-sm"
                  >
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
                      ? 'bg-purple-600'
                      : 'bg-gray-200'
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
            <div 
              style={{ borderBottomColor: darkMode ? '#374151' : '#e5e7eb' }}
              className="flex items-center justify-between py-4 border-b"
            >
              <div className="flex items-center space-x-3">
                <div 
                  style={{ backgroundColor: darkMode ? '#14532d' : '#dcfce7' }}
                  className="p-2 rounded-lg"
                >
                  <FiBell 
                    style={{ color: darkMode ? '#4ade80' : '#16a34a' }}
                    size={20} 
                  />
                </div>
                <div>
                  <h3 
                    style={{ color: darkMode ? '#ffffff' : '#111827' }}
                    className="text-lg font-medium"
                  >
                    Email Notifications
                  </h3>
                  <p 
                    style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
                    className="text-sm"
                  >
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
                      ? 'bg-green-600'
                      : darkMode ? 'bg-gray-600' : 'bg-gray-200'
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
                <div 
                  style={{ backgroundColor: darkMode ? '#92400e' : '#fef3c7' }}
                  className="p-2 rounded-lg"
                >
                  <FiBell 
                    style={{ color: darkMode ? '#fbbf24' : '#d97706' }}
                    size={20} 
                  />
                </div>
                <div>
                  <h3 
                    style={{ color: darkMode ? '#ffffff' : '#111827' }}
                    className="text-lg font-medium"
                  >
                    Push Notifications
                  </h3>
                  <p 
                    style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
                    className="text-sm"
                  >
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
                      ? 'bg-yellow-600'
                      : darkMode ? 'bg-gray-600' : 'bg-gray-200'
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
          <div 
            style={{ 
              backgroundColor: darkMode ? '#374151' : '#f9fafb',
              borderTopColor: darkMode ? '#4b5563' : '#e5e7eb'
            }}
            className="px-6 py-4 border-t rounded-b-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {saveStatus === 'success' && (
                  <div 
                    style={{ color: darkMode ? '#4ade80' : '#16a34a' }}
                    className="flex items-center space-x-1"
                  >
                    <FiCheck size={16} />
                    <span className="text-sm">Settings saved successfully!</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div 
                    style={{ color: darkMode ? '#f87171' : '#dc2626' }}
                    className="flex items-center space-x-1"
                  >
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
                    ? darkMode 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSaving ? 'Saving...' : isLoading ? 'Loading...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Settings Sections (Placeholder) */}
        <div 
          style={cardStyle}
          className="mt-6 rounded-lg shadow-md border"
        >
          <div className="p-6">
            <h2 
              style={{ color: darkMode ? '#ffffff' : '#111827' }}
              className="text-xl font-semibold mb-4"
            >
              Other Settings
            </h2>
            <p 
              style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
            >
              More settings options will be added here in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 