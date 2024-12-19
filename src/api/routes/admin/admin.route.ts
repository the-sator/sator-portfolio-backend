import { validateData } from "@/utils/validator";
import { Router } from "express";
import { AdminController } from "../../controllers/admin.controller";
import { AssignAdminRoleSchema, CreateAdminSchema } from "@/types/admin.type";
import protectedRoute from "@/authentication/protected-route";
import { LoginSchema } from "@/types/auth.type";
const router = Router();
const adminController = new AdminController();
export default (app: Router) => {
  app.use("/", router);
  router.get(
    "/",
    protectedRoute(adminController.getAdmins, {
      resource: "Admin",
      action: "read",
    })
  );
  router.get("/me", adminController.getAdminSession);
  // router.get("/", adminController.getAdmins);
  router.post(
    "/signup",
    validateData(CreateAdminSchema),
    adminController.signup
  );
  router.post("/login", validateData(LoginSchema), adminController.login);
  router.post("/signout", adminController.signout);
  router.post("/totp", protectedRoute(adminController.updateAdminTotp));
  router.post(
    "/assign",
    validateData(AssignAdminRoleSchema),
    protectedRoute(adminController.assignRole, {
      resource: "Admin",
      action: "write",
    })
  );
};
