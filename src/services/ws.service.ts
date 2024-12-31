import { WSEventType, WSReceiver } from "@/enum/ws-event.enum";
import { io } from "@/loaders/socket";
import { Server } from "socket.io";
import { CacheService } from "./cache.service";
import { ThrowInternalServer } from "@/utils/exception";

export class WSService {
  private cacheService: CacheService;
  constructor() {
    this.cacheService = new CacheService();
  }
  private get io(): Server {
    if (!io) {
      throw new Error(
        "Socket.IO is not initialized. Ensure socketLoader is run first."
      );
    }
    return io;
  }

  public broadcastAll(event: WSEventType, data: any) {
    this.io.emit(WSReceiver.ALL, {
      type: event,
      data,
    });
  }

  public async broadcastToOne(
    id: string,
    audience: WSReceiver,
    eventType: WSEventType,
    data: any
  ) {
    const event = `${audience}:${id}`;
    const sid = await this.cacheService.getSid(id);
    if (!sid) {
      return;
    }
    this.io.to(sid).emit(event, {
      type: eventType,
      data,
    });
  }

  public async broadcastToMany(
    ids: string[],
    audience: WSReceiver,
    eventType: WSEventType,
    data: any
  ) {
    await Promise.all(
      ids.map(async (id) => {
        const event = `${audience}:${id}`;
        const sid = await this.cacheService.getSid(id);
        if (!sid) {
          return;
        }
        this.io.to(sid).emit(event, {
          type: eventType,
          data,
        });
      })
    );
  }

  public broadcastToRoom(id: string, eventType: WSEventType, data: any) {
    const event = `${WSReceiver.CHAT_ROOM}:${id}`;
    this.io.emit(event, {
      type: eventType,
      data,
    });
  }
}
