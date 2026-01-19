// Cliente Redis compartilhado
import { createClient } from 'redis';

let redisClient = null;

export async function getRedisClient() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redisClient = createClient({
    url: redisUrl
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  return redisClient;
}
