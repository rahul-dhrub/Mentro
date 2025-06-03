import { useState, useEffect } from 'react';
import { fetchUserByEmail, fetchUsersByEmails } from '@/lib/utils/userUtils';

interface UserData {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  title?: string;
  department?: string;
}

/**
 * Hook to fetch and cache user data by email
 */
export const useUserData = (email: string | null) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      setUserData(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchUserByEmail(email);
        setUserData(data);
      } catch (err) {
        setError('Failed to fetch user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

  return { userData, loading, error };
};

/**
 * Hook to fetch and cache multiple users data by their emails
 */
export const useUsersData = (emails: string[]) => {
  const [usersData, setUsersData] = useState<Map<string, UserData>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emails.length === 0) {
      setUsersData(new Map());
      setLoading(false);
      return;
    }

    // Filter out emails that are already cached
    const uncachedEmails = emails.filter(email => !usersData.has(email));
    
    if (uncachedEmails.length === 0) {
      return; // All emails are already cached
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const newUsersData = await fetchUsersByEmails(uncachedEmails);
        
        // Merge with existing cache
        setUsersData(prevData => {
          const merged = new Map(prevData);
          newUsersData.forEach((userData, email) => {
            merged.set(email, userData);
          });
          return merged;
        });
      } catch (err) {
        setError('Failed to fetch users data');
        console.error('Error fetching users data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [emails, usersData]);

  const getUserData = (email: string): UserData | null => {
    return usersData.get(email) || null;
  };

  return { usersData, getUserData, loading, error };
}; 