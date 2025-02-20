import { redisClient } from "@/loaders/redis";
import type { Auth } from "@/types/auth.type";
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
    this.redis.set(`socket:${id}`, sid);
  }

  public userOffline(id: string) {
    this.redis.del(`socket:${id}`);
  }

  public async getSid(id: string) {
    return await this.redis.get(`socket:${id}`);
  }

  public saveAuth(auth_id: string, auth: Partial<Auth>) {
    this.redis.set(`auth:${auth_id}`, JSON.stringify(auth));
  }
  public async getAuth(auth_id: string) {
    await this.redis.get(`auth:${auth_id}`);
  }
  public deleteAuth(auth_id: string) {
    this.redis.del(`auth:${auth_id}`);
  }
}
