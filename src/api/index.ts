import { Router } from "express";
import user from "./routes/user.route";
import chatRoom from "./routes/chat-room.route";
import chatMember from "./routes/chat-member.route";
import chatMessage from "./routes/chat-message.route";
import adminRouteUser from "./routes/admin/user.route";
import adminRouteAdmin from "./routes/admin/admin.route";
import adminRouteRole from "./routes/admin/role.route";
import adminRouteResource from "./routes/admin/resource.route";
import adminRoutePortfolio from "./routes/admin/portfolio.route";
import adminRouteCategory from "./routes/admin/category.route";
import adminRouteFormQuestion from "./routes/admin/form-question.route";
import adminRouteChatRoom from "./routes/admin/chat-room.route";
import adminRouteChatMessage from "./routes/admin/chat-message.route";
import adminRouteChatMember from "./routes/admin/chat-member.route";

// guaranteed to get dependencies

export default () => {
  const app = Router();

  // User routes remain top-level
  user(app);
  chatRoom(app);
  chatMember(app);
  chatMessage(app);

  // Admin routes group
  const adminRouter = Router();
  adminRouteUser(adminRouter);
  adminRouteAdmin(adminRouter);
  adminRouteRole(adminRouter);
  adminRouteResource(adminRouter);
  adminRoutePortfolio(adminRouter);
  adminRouteCategory(adminRouter);
  adminRouteFormQuestion(adminRouter);
  adminRouteChatRoom(adminRouter);
  adminRouteChatMessage(adminRouter);
  adminRouteChatMember(adminRouter);
  app.use("/admin", adminRouter);

  return app;
};
