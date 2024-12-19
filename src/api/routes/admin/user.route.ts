import { UserController } from "@/api/controllers/user.controller";
import protectedRoute from "@/authentication/protected-route";
import { CreateUserSchema } from "@/types/user.type";
import { validateData } from "@/utils/validator";
import { Router } from "express";

const router = Router();
const userController = new UserController();

export default (app: Router) => {
  app.use("/user", router);
  router.get(
    "/all",
    protectedRoute(userController.getUsers, {
      resource: "User",
      action: "read",
    })
  );
  router.get(
    "/",
    protectedRoute(userController.paginateUsers, {
      resource: "User",
      action: "read",
    })
  );
  router.post("/", validateData(CreateUserSchema), userController.addUser);
};
