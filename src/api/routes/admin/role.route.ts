import { Router } from "express";
import { RoleController } from "../../controllers/role.controller";
import protectedRoute from "@/authentication/protected-route";
import { validateData } from "@/utils/validator";
import { CreateRoleSchema, UpdateRoleSchema } from "@/types/role.type";

const router = Router();
const roleController = new RoleController();

export default (app: Router) => {
  app.use("/role", router);
  router.get("/", protectedRoute(roleController.getRoles));
  router.get("/:id", protectedRoute(roleController.getRoleById));
  router.put(
    "/:id",
    validateData(UpdateRoleSchema),
    protectedRoute(roleController.updateRole)
  );
  router.post("/check", protectedRoute(roleController.checkRole));
  router.post(
    "/",
    validateData(CreateRoleSchema),
    protectedRoute(roleController.createRole)
  );
  router.delete(
    "/:id",
    protectedRoute(roleController.deleteRole, {
      resource: "Role",
      action: "delete",
    })
  );
};
