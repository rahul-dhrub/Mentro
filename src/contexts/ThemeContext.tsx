'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

interface Settings {
  darkMode: boolean;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  timezone: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from database on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          const { settings } = data;
          
          setDarkMode(settings.darkMode);
          setNotificationsEnabled(settings.notificationsEnabled);
          
          // Apply dark mode class to document
          if (settings.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } else {
          // Fallback to localStorage if API fails
          const savedDarkMode = localStorage.getItem('darkMode');
          const savedNotifications = localStorage.getItem('notificationsEnabled');
          
          if (savedDarkMode !== null) {
            const isDarkMode = JSON.parse(savedDarkMode);
            setDarkMode(isDarkMode);
            if (isDarkMode) {
              document.documentElement.classList.add('dark');
            }
          }
          
          if (savedNotifications !== null) {
            setNotificationsEnabled(JSON.parse(savedNotifications));
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to localStorage
        const savedDarkMode = localStorage.getItem('darkMode');
        const savedNotifications = localStorage.getItem('notificationsEnabled');
        
        if (savedDarkMode !== null) {
          const isDarkMode = JSON.parse(savedDarkMode);
          setDarkMode(isDarkMode);
          if (isDarkMode) {
            document.documentElement.classList.add('dark');
          }
        }
        
        if (savedNotifications !== null) {
          setNotificationsEnabled(JSON.parse(savedNotifications));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        // Update local state
        if (typeof newSettings.darkMode !== 'undefined') {
          setDarkMode(newSettings.darkMode);
          
          // Apply dark mode class
          if (newSettings.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        
        if (typeof newSettings.notificationsEnabled !== 'undefined') {
          setNotificationsEnabled(newSettings.notificationsEnabled);
        }
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      // Fallback to localStorage
      if (typeof newSettings.darkMode !== 'undefined') {
        localStorage.setItem('darkMode', JSON.stringify(newSettings.darkMode));
      }
      if (typeof newSettings.notificationsEnabled !== 'undefined') {
        localStorage.setItem('notificationsEnabled', JSON.stringify(newSettings.notificationsEnabled));
      }
      throw error;
    }
  };

  const refreshSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        const { settings } = data;
        
        setDarkMode(settings.darkMode);
        setNotificationsEnabled(settings.notificationsEnabled);
        
        // Apply dark mode class
        if (settings.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      console.error('Error refreshing settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    await updateSettings({ darkMode: newDarkMode });
  };

  const toggleNotifications = async () => {
    const newNotificationsEnabled = !notificationsEnabled;
    await updateSettings({ notificationsEnabled: newNotificationsEnabled });
  };

  const value: ThemeContextType = {
    darkMode,
    toggleDarkMode,
    notificationsEnabled,
    toggleNotifications,
    updateSettings,
    refreshSettings,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
} 