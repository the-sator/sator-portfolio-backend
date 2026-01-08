import { Router } from "express";
import { ChatMessageController } from "@/api/controllers/chat-message.controller";
import protectedRoute from "@/core/authentication/protected-route";

const router = Router();
const chatMessageController = new ChatMessageController();
export default (app: Router) => {
  app.use("/chat-message", router);
  //   router.get("/:roomId", protectedRoute(chatMessageController.findByRoomId));
  router.get(
    "/:roomId",
    protectedRoute(chatMessageController.paginateByRoomId)
  );
  router.post("/", protectedRoute(chatMessageController.create));
};
