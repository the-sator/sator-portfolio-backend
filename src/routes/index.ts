import { Router, type Request, type Response } from "express";
import {
  // adminRouteBlog,
  // adminRouteCategory,
  // adminRouteChatMember,
  // adminRouteChatMessage,
  // adminRouteChatRoom,
  // adminRouteFormQuestion,
  // adminRoutePortfolio,
  // adminRouteResource,
  // adminRouteUser,
  // adminUnreadMessage,
  adminRouteBlog,
  adminRouteRole,
  adminSiteUser,
} from "./admin";
import {
  // blog,
  // chatMember,
  // chatMessage,
  // chatRoom,
  // formAttempt,
  // formQuestion,
  // test,
  // unreadMessage,
  user,
} from "./user";
import {
  siteUser,
  // siteUserBlog,
  // siteUserCategory,
  // siteUserPortfolio,
  // siteUserStatistic,
} from "./site-user";

// guaranteed to get dependencies

export default () => {
  const app = Router();

  //Health Check
  app.get("/health-check", (_req: Request, res: Response) => {
    const data = {
      uptime: process.uptime(),
      message: "OK",
      date: new Date(),
    };
    res.status(200).send(data);
  });

  // User routes remain top-level
  user(app);
  // chatRoom(app);
  // chatMember(app);
  // chatMessage(app);
  // unreadMessage(app);
  // formQuestion(app);
  // formAttempt(app);
  // blog(app);
  // test(app);

  // Site user routes group
  const siteUserRouter = Router();
  siteUser(siteUserRouter);
  // siteUserPortfolio(siteUserRouter);
  // siteUserCategory(siteUserRouter);
  // siteUserStatistic(siteUserRouter);
  // siteUserBlog(siteUserRouter);
  app.use("/site-users", siteUserRouter);

  // Admin routes group
  const adminRouter = Router();
  // adminRouteAdmin(adminRouter);
  adminRouteRole(adminRouter);
  adminRouteBlog(adminRouter);
  // adminRouteUser(adminRouter);
  // adminRouteResource(adminRouter);
  // adminRoutePortfolio(adminRouter);
  // adminRouteCategory(adminRouter);
  // adminRouteFormQuestion(adminRouter);
  // adminRouteChatRoom(adminRouter);
  // adminRouteChatMessage(adminRouter);
  // adminRouteChatMember(adminRouter);
  // adminUnreadMessage(adminRouter);
  adminSiteUser(adminRouter);
  app.use("/admins", adminRouter);

  return app;
};
