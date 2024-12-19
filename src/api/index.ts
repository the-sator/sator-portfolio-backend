import { Router } from "express";
import user from "./routes/user.route";
import admin from "./routes/admin/admin.route";
import role from "./routes/admin/role.route";
import resource from "./routes/admin/resource.route";
import portfolio from "./routes/admin/portfolio.route";
import category from "./routes/admin/category.route";
import blogRoute from "./routes/blog.route";
import formQuestion from "./routes/admin/form-question.route";
import chatRoom from "./routes/chat-room.route";
import chatMember from "./routes/chat-member.route";
import chatMessage from "./routes/chat-message.route";

// guaranteed to get dependencies

export default () => {
  const app = Router();

  // User routes remain top-level
  user(app);
  chatRoom(app);
  chatMember(app);
  chatMessage(app);
  blogRoute(app);

  // Admin routes group
  const adminRouter = Router();
  admin(adminRouter);
  role(adminRouter);
  resource(adminRouter);
  portfolio(adminRouter);
  category(adminRouter);
  formQuestion(adminRouter);
  chatRoom(adminRouter);
  chatMessage(adminRouter);
  chatMember(adminRouter);
  app.use("/admin", adminRouter);

  return app;
};
