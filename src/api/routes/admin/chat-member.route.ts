import { Router } from "express";
import { ChatMemberController } from "../../controllers/chat-member.controller";
import protectedRoute from "@/authentication/protected-route";

const router = Router();
const chatMemberController = new ChatMemberController();

export default (app: Router) => {
  app.use("/chat-member", router);
  router.get("/", protectedRoute(chatMemberController.findAll));
  router.get(
    "/all/:id?",
    protectedRoute(chatMemberController.findAllInvitableMember)
  );
  router.post("/join", protectedRoute(chatMemberController.join));
  router.post("/invite", protectedRoute(chatMemberController.invite));
  router.delete("/:id", protectedRoute(chatMemberController.remove));
  router.post("/:id/leave", protectedRoute(chatMemberController.leave));
};
