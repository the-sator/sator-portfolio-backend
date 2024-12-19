import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateData } from "@/utils/validator";
import protectedRoute from "@/authentication/protected-route";
import { CreateUserSchema } from "@/types/user.type";

const router = Router();
const userController = new UserController();

export default (app: Router) => {
  app.use("/user", router);
  router.post("/", userController.userLogin);
  router.get("/me", userController.getUserSession);
};
