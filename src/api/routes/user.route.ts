import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();
const userController = new UserController();

export default (app: Router) => {
  app.use("/user", router);
  router.post("/", userController.userLogin);
  router.get("/me", userController.getMe);
};
