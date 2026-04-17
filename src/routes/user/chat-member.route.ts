import { Router } from "express";
import { ChatMemberController } from "@/api/controllers/chat-member.controller";
import protectedRoute from "@/core/authentication/protected-route";

export default (app: Router) => {
  const router = Router();
  const chatMemberController = new ChatMemberController();

  app.use("/chat-member", router);
  router.post("/join", protectedRoute(chatMemberController.join));
};
