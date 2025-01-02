import { UnreadMessageController } from "@/api/controllers/unread-message.controller";
import protectedRoute from "@/authentication/protected-route";
import { Router } from "express";

const router = Router();
const unreadMessageController = new UnreadMessageController();

export default (app: Router) => {
  app.use("/unread", router);
  router.get("/", protectedRoute(unreadMessageController.getByAuthId));
  router.post("/:id", protectedRoute(unreadMessageController.markAsRead));
};
