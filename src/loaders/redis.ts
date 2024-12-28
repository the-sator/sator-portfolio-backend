import { createClient, type RedisClientType } from "redis";

let redisClient: RedisClientType;

export function redisLoader() {
  redisClient = createClient({ url: process.env.REDIS_URL });

  redisClient.on("error", (err) => {
    console.error("Redis Client Error", err);
  });

  redisClient.connect().then(() => {
    console.log("Redis client connected");
  });

  return redisClient;
}

export { redisClient };
