import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateData } from "@/utils/validator";
import { CreateUserSchema } from "@/types/user.type";
import protectedRoute from "@/authentication/protected-route";

const router = Router();
const userController = new UserController();

export default (app: Router) => {
  app.use("/users", router);
  router.get(
    "/",
    protectedRoute(userController.getUsers, {
      resource: "User",
      action: "read",
    })
  );
  router.get("/about", function (req, res) {
    res.send("About this wiki");
  });
  router.post("/", validateData(CreateUserSchema), userController.addUser);
};
