import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";

let io: Server;

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
    console.log("A user connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });

    socket.on(`join-room`, (payload) => {
      socket.join(payload.data.id);
    });

    socket.on(`leave-room`, (msg) => {
      socket.broadcast.emit("message", msg);
    });
  });

  // Start the server
  const port = process.env.SOCKET_PORT || 8080; // Adjust as needed
  server.listen(port, () => {
    console.log(`Socket.IO server running on port ${port}`);
  });

  return io;
}

export { io };
