import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { CacheService } from "@/services/cache.service";
import { UnreadMessageService } from "@/services/unread-message.service";

let io: Server;
const cacheService = new CacheService();
const unreadMessageService = new UnreadMessageService();

export function socketLoader({ app }: { app: express.Application }) {
  const server = createServer(app);

  // Initialize Socket.IO and assign to the module-level variable
  io = new Server(server, {
    path: "/socket.io",
    cors: {
      origin: "*",
    },
  });

  // Handle WebSocket connections
  io.on("connection", (socket) => {
    if (socket.handshake.query.auth_id) {
      cacheService.saveOnlineUser(
        socket.handshake.query.auth_id as string,
        socket.id
      );
    }
    console.log(
      `A user connected: ${socket.id}, auth id: ${socket.handshake.query.auth_id}`
    );

    socket.on("disconnect", () => {
      if (socket.handshake.query.auth_id) {
        cacheService.userOffline(socket.handshake.query.auth_id as string);
      }
      console.log(
        `A user disconnected: ${socket.id}, auth id: ${socket.handshake.query.auth_id}`
      );
    });

    socket.on(`leave-room`, (msg) => {
      socket.broadcast.emit("message", msg);
    });

    socket.on("mark-as-read", (payload) => {
      unreadMessageService.updateUnread(payload.id, 0);
    });

    // socket.on("online", (id: string) => {});
  });

  const port =
    process.env.NODE_ENV === "test" ? 0 : process.env.SOCKET_PORT || 8080;

  // Start the server

  server.listen(port, () => {
    console.log(`Socket.IO server running on port ${port}`);
  });

  return io;
}

export { io };
