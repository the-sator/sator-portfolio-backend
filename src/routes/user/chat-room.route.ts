import protectedRoute from "@/core/authentication/protected-route";
import { Router } from "express";
import { ChatRoomController } from "@/api/controllers/chat-room.controller";

export default (app: Router) => {
  const router = Router();
  const chatRoomController = new ChatRoomController();

  app.use("/chat-room", router);
  router.get("/user", protectedRoute(chatRoomController.findUserChatRoom));
  router.get("/:id", protectedRoute(chatRoomController.findById));
};
