import { Router } from "express";
import { BlogController } from "../controllers/blog.controller";
import protectedRoute from "@/authentication/protected-route";

const router = Router();
const blogController = new BlogController();

export default (app: Router) => {
  app.use("/blog", router);
  router.get("/", blogController.findAll);
};
