import protectedRoute from "@/authentication/protected-route";
import { ChatRoomController } from "@/api/controllers/chat-room.controller";
import { Router } from "express";

const router = Router();
const chatRoomController = new ChatRoomController();

export default (app: Router) => {
  app.use("/chat-room", router);
  router.get("/", protectedRoute(chatRoomController.findAll));
  router.get("/:id", protectedRoute(chatRoomController.findById));
  router.post("/", protectedRoute(chatRoomController.create));
};
