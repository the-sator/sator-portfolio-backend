import { SiteUserController } from "@/api/controllers/site-user.controller";
import protectedRoute from "@/authentication/protected-route";
import { Router } from "express";

const router = Router();
const siteUserController = new SiteUserController();
export default (app: Router) => {
  app.use("/site-user", router);
  router.get("/", protectedRoute(siteUserController.paginateSiteUsers));
  router.post("/", protectedRoute(siteUserController.createSiteUsers));
};
