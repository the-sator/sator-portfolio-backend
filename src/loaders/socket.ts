import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { redisClient } from "./redis";
import { CacheService } from "@/services/cache.service";

let io: Server;
const cacheService = new CacheService();

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
      console.log("A user disconnected:", socket.id);
    });

    socket.on(`join-room`, (payload) => {
      // {jsdajsd: skdajksldjas}
      // contsole.log(payload);
      // socket.join(payload.id);
    });

    socket.on(`leave-room`, (msg) => {
      socket.broadcast.emit("message", msg);
    });

    socket.on("online", (id: string) => {});
  });

  // Start the server
  const port = process.env.SOCKET_PORT || 8080;
  server.listen(port, () => {
    console.log(`Socket.IO server running on port ${port}`);
  });

  return io;
}

export { io };
