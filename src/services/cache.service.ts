import { redisClient } from "@/loaders/redis";
import type { RedisClientType } from "redis";

export class CacheService {
  private get redis(): RedisClientType {
    if (!redisClient) {
      throw new Error(
        "Redis is not initialized. Ensure redisSocket is run first."
      );
    }
    return redisClient;
  }

  public saveOnlineUser(id: string, sid: string) {
    this.redis.set(id, sid);
  }

  public userOffline(id: string) {
    this.redis.del(id);
  }

  public async getSid(id: string) {
    return await this.redis.get(id);
  }
}
