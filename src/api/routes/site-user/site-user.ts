import { SiteUserController } from "@/api/controllers/site-user.controller";
import { LoginSchema } from "@/types/auth.type";
import { validateData } from "@/utils/validator";
import { Router } from "express";

const router = Router();
const siteUserController = new SiteUserController();

export default (app: Router) => {
  app.use("/", router);
  router.get("/me", siteUserController.getSiteUserSession);
  router.post(
    "/login",
    validateData(LoginSchema),
    siteUserController.siteUserLogin
  );
  router.post("/signout", siteUserController.siteUserSignout);
};
