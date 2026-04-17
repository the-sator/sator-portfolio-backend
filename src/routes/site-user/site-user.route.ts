import { SiteUserController } from "@/modules/site-user/site-user.controller";
import protectedSiteUserRoute from "@/core/authentication/protected-site-user-route";
import { validateData } from "@/utils/validator";
import { Router } from "express";
import { SiteUserSigninSchema } from "@/modules/site-user/dto/site-user-signin.dto";
import { OnboardingSchema } from "@/modules/site-user/dto/onboarding.dto";

export default (app: Router) => {
  const router = Router();
  const siteUserController = new SiteUserController();

  app.use("/", router);
  router.get("/me", siteUserController.getMe);
  router.post(
    "/:id/login",
    validateData(SiteUserSigninSchema),
    siteUserController.siteUserLogin,
  );
  router.get("/:id/check-registration", siteUserController.checkIsRegistered);
  // router.post(
  //   "/:id/first-login",
  //   validateData(OnboardingSchema),
  //   siteUserController.firstLogin
  // );
  router.post("/signout", siteUserController.siteUserSignout);
  router.post("/view", siteUserController.increaseView);
  router.post("/totp", protectedSiteUserRoute(siteUserController.updateTotp));
  router.put(
    "/:id/auth",
    validateData(OnboardingSchema),
    siteUserController.updateAuth,
  );
};
