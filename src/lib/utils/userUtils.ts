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
 * Fetch user data by email from the users database
 */
export const fetchUserByEmail = async (email: string): Promise<UserData | null> => {
  try {
    const encodedEmail = encodeURIComponent(email);
    const response = await fetch(`/api/users/by-email/${encodedEmail}`);
    
    if (response.ok) {
      const data = await response.json();
      return data.user;
    } else if (response.status === 404) {
      // User not found in database
      return null;
    } else {
      console.error('Error fetching user data:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/**
 * Generate initials from a person's name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2); // Get first 2 initials
};

/**
 * Generate a consistent color class based on a name
 */
export const getColorFromName = (name: string): string => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Batch fetch user data for multiple emails
 */
export const fetchUsersByEmails = async (emails: string[]): Promise<Map<string, UserData>> => {
  const userMap = new Map<string, UserData>();
  
  try {
    const results = await Promise.allSettled(
      emails.map(email => fetchUserByEmail(email))
    );
    
    results.forEach((result, index) => {
      const email = emails[index];
      if (result.status === 'fulfilled' && result.value) {
        userMap.set(email, result.value);
      }
    });
  } catch (error) {
    console.error('Error batch fetching users:', error);
  }
  
  return userMap;
};