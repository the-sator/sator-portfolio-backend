import protectedRoute from "@/core/authentication/protected-route";
import { SiteUserController } from "@/modules/site-user/site-user.controller";
import { Router } from "express";

export default (app: Router) => {
  const router = Router();
  const siteUserController = new SiteUserController();
  app.use("/site-users", router);
  router.get("/", protectedRoute(siteUserController.paginateSiteUsers));
  router.post("/", protectedRoute(siteUserController.createSiteUsers));
};
