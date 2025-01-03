import { Router } from "express";
import { ChatMessageController } from "../controllers/chat-message.controller";
import protectedRoute from "@/authentication/protected-route";

const router = Router();
const chatMessageController = new ChatMessageController();
export default (app: Router) => {
  app.use("/chat-message", router);
  router.get(
    "/:roomId",
    protectedRoute(chatMessageController.paginateByRoomId)
  );
  router.post("/", protectedRoute(chatMessageController.create));
};
