import { Router } from "express";
import { BlogController } from "../controllers/blog.controller";

const router = Router();
const blogController = new BlogController();

export default (app: Router) => {
  app.use("/blog", router);
  router.get("/", blogController.getAll);
  router.get("/:slug", blogController.getBlogBySlug);
  router.post("/:slug/view", blogController.increaseView);
};
