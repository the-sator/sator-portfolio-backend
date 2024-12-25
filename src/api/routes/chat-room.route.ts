import protectedRoute from "@/authentication/protected-route";
import { Router } from "express";
import { ChatRoomController } from "../controllers/chat-room.controller";

const router = Router();
const chatRoomController = new ChatRoomController();

export default (app: Router) => {
  app.use("/chat-room", router);
  router.get("/user", protectedRoute(chatRoomController.findUserChatRoom));
  router.get("/:id", protectedRoute(chatRoomController.findById));
};
