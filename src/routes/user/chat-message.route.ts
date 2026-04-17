import { Router } from "express";
import { ChatMessageController } from "@/api/controllers/chat-message.controller";
import protectedRoute from "@/core/authentication/protected-route";

export default (app: Router) => {
  const router = Router();
  const chatMessageController = new ChatMessageController();

  app.use("/chat-message", router);
  router.get(
    "/:roomId",
    protectedRoute(chatMessageController.paginateByRoomId),
  );
  router.post("/", protectedRoute(chatMessageController.create));
};
