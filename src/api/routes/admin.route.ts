import { validateData } from "@/utils/validator";
import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { CreateAdminSchema, LoginSchema } from "@/types/admin.type";
import { ValidateSessionTokenSchema } from "@/types/base.type";
import protectedRoute from "@/authentication/protected-route";
const router = Router();
const adminController = new AdminController();
export default (app: Router) => {
  app.use("/admin", router);
  router.get("/", protectedRoute(adminController.getAdmins));
  router.get("/session", adminController.getSession);
  // router.get("/", adminController.getAdmins);
  router.post(
    "/signup",
    validateData(CreateAdminSchema),
    adminController.signup
  );
  router.post("/login", validateData(LoginSchema), adminController.login);
  router.post("/signout", adminController.signout);
  router.post("/totp", protectedRoute(adminController.updateAdminTotp));
};
