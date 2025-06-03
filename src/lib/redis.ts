import { createClient } from 'redis';

// Create Redis client with error handling
const createRedisClient = () => {
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  client.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  client.on('connect', () => {
    console.log('Redis Client Connected');
  });

  return client;
};

let redisClient: ReturnType<typeof createClient> | null = null;

export const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createRedisClient();
    await redisClient.connect();
  }
  return redisClient;
};

// Heartbeat operations
export const setUserHeartbeat = async (userId: string, userData: any) => {
  try {
    const client = await getRedisClient();
    const key = `heartbeat:${userId}`;
    const data = {
      ...userData,
      lastSeen: Date.now(),
    };
    
    // Set with 5 minute TTL
    await client.setEx(key, 300, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error setting user heartbeat:', error);
    return false;
  }
};

export const getUserHeartbeat = async (userId: string) => {
  try {
    const client = await getRedisClient();
    const key = `heartbeat:${userId}`;
    const data = await client.get(key);
    
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting user heartbeat:', error);
    return null;
  }
};

export const getAllActiveUsers = async () => {
  try {
    const client = await getRedisClient();
    const keys = await client.keys('heartbeat:*');
    
    if (keys.length === 0) return [];
    
    const pipeline = client.multi();
    keys.forEach(key => pipeline.get(key));
    
    const results = await pipeline.exec();
    const activeUsers = [];
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result && typeof result === 'string') {
        try {
          const userData = JSON.parse(result);
          const now = Date.now();
          const timeDiff = now - userData.lastSeen;
          
          // Determine status based on last seen time
          let status = 'offline';
          if (timeDiff <= 5000) { // 5 seconds
            status = 'online';
          } else if (timeDiff <= 60000) { // 1 minute
            status = 'away';
          }
          
          activeUsers.push({
            ...userData,
            status,
            lastSeenMs: timeDiff
          });
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
        }
      }
    }
    
    return activeUsers;
  } catch (error) {
    console.error('Error getting all active users:', error);
    return [];
  }
};

export const removeUserHeartbeat = async (userId: string) => {
  try {
    const client = await getRedisClient();
    const key = `heartbeat:${userId}`;
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Error removing user heartbeat:', error);
    return false;
  }
};

export default { 
  setUserHeartbeat, 
  getUserHeartbeat, 
  getAllActiveUsers, 
  removeUserHeartbeat 
}; 