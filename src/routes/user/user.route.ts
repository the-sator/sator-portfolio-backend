import protectedRoute from "@/core/authentication/protected-route";
import { SignInSchema } from "@/modules/auth/dto/sign-in.dto";
import { SignUpSchema } from "@/modules/auth/dto/sign-up.dto";
import { CreateUserSchema } from "@/modules/users/dto";
import { AssignRoleSchema } from "@/modules/users/dto/assign-role.dto";
import { UserController } from "@/modules/users/user.controller";
import { validateData } from "@/utils/validator";
import { Router } from "express";

const router = Router();
const userController = new UserController();

export default (app: Router) => {
  app.use("/users", router);
  // router.get(
  //   "/all",
  //   protectedRoute(userController.getUsers, {
  //     resource: "User",
  //     action: "read",
  //   })
  // );
  // router.get(
  //   "/",
  //   protectedRoute(userController.paginateUsers, {
  //     resource: "User",
  //     action: "read",
  //   })
  // );
  router.post("/", validateData(CreateUserSchema), userController.signup);
  router.get("/me", userController.getMe);
  // router.get("/", userController.getAdmins);
  router.post("/signup", validateData(SignUpSchema), userController.signup);
  router.post("/login", validateData(SignInSchema), userController.login);
  router.post("/signout", userController.signout);
  // router.post("/totp", protectedRoute(userController.));
  router.post(
    "/assign",
    validateData(AssignRoleSchema),
    protectedRoute(userController.assignRole, {
      resource: "Admin",
      action: "write",
    })
  );
};
