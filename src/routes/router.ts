import { Router, type Request, type Response } from "express";
import registerUserRoutes from "./user";
import registerSiteUserRoutes from "./site-user";

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

  registerUserRoutes(app);
  registerSiteUserRoutes(app);

  // const siteUserRouter = Router();
  // registerSiteUserRoutes(siteUserRouter);
  // app.use("/site-users", siteUserRouter);

  // Admin routes group
  // const adminRouter = Router();
  // adminRouteAdmin(adminRouter);
  // adminRouteRole(adminRouter);
  // adminRouteBlog(adminRouter);
  // adminRouteUser(adminRouter);
  // adminRouteResource(adminRouter);
  // adminRoutePortfolio(adminRouter);
  // adminRouteCategory(adminRouter);
  // adminRouteFormQuestion(adminRouter);
  // adminRouteChatRoom(adminRouter);
  // adminRouteChatMessage(adminRouter);
  // adminRouteChatMember(adminRouter);
  // adminUnreadMessage(adminRouter);
  // app.use("/admins", adminRouter);

  return app;
};
