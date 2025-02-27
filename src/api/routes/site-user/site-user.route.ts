import { SiteUserController } from "@/api/controllers/site-user.controller";
import { LoginSchema } from "@/types/auth.type";
import { SiteUserAuthSchema } from "@/types/site-user.type";
import { validateData } from "@/utils/validator";
import { Router } from "express";

const router = Router();
const siteUserController = new SiteUserController();

export default (app: Router) => {
  app.use("/", router);
  router.get("/me", siteUserController.getMe);
  router.post(
    "/login",
    validateData(LoginSchema),
    siteUserController.siteUserLogin
  );
  router.get("/:id/check-registration", siteUserController.checkIsRegistered);
  router.post(
    "/:id/first-login",
    validateData(SiteUserAuthSchema),
    siteUserController.firstLogin
  );
  router.post("/signout", siteUserController.siteUserSignout);
  router.put(
    "/:id/auth",
    validateData(SiteUserAuthSchema),
    siteUserController.updateAuth
  );
};
