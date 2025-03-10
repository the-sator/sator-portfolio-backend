import { SiteUserController } from "@/api/controllers/site-user.controller";
import protectedSiteUserRoute from "@/authentication/protected-site-user-route";
import { OnboardingSchema, SiteUserAuthSchema } from "@/types/site-user.type";
import { validateData } from "@/utils/validator";
import { Router } from "express";

const router = Router();
const siteUserController = new SiteUserController();

export default (app: Router) => {
  app.use("/", router);
  router.get("/me", siteUserController.getMe);
  router.post(
    "/:id/login",
    validateData(SiteUserAuthSchema),
    siteUserController.siteUserLogin
  );
  router.get("/:id/check-registration", siteUserController.checkIsRegistered);
  router.post(
    "/:id/first-login",
    validateData(OnboardingSchema),
    siteUserController.firstLogin
  );
  router.post("/signout", siteUserController.siteUserSignout);
  router.post("/view", siteUserController.increaseView);
  router.post("/totp", protectedSiteUserRoute(siteUserController.updateTotp));
  router.put(
    "/:id/auth",
    validateData(OnboardingSchema),
    siteUserController.updateAuth
  );
};
