import { Router } from "express";
import user from "./user.route";
import chatRoom from "./chat-room.route";
import chatMessage from "./chat-message.route";
import chatMember from "./chat-member.route";
import unreadMessage from "./unread-message.route";
import blog from "./blog.route";
import formQuestion from "./form-question.route";
import formAttempt from "./form-attempt.route";
import siteUser from "./site-user.route"; // Admin management of site users

// Add new routes to this array
const routes = [
  user,
  chatRoom,
  chatMessage,
  chatMember,
  unreadMessage,
  blog,
  formQuestion,
  formAttempt,
  siteUser,
];

export default (app: Router) => {
  const router = Router();
  app.use("/users", router);
  routes.forEach((routeFn) => routeFn(router));
};
