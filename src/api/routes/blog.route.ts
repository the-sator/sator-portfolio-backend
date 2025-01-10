import { Router } from "express";
import { BlogController } from "../controllers/blog.controller";

const router = Router();
const blogController = new BlogController();

export default (app: Router) => {
  app.use("/blog", router);
  router.get("/", blogController.findAll);
  router.get("/:slug", blogController.findBlogBySlug);
  router.post("/:slug/view", blogController.increaseView);
};
