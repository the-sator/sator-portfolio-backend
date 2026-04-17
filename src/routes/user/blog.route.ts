import { BlogController } from "@/modules/blog/blog.controller";
import { Router } from "express";

export default (app: Router) => {
  const router = Router();
  const blogController = new BlogController();

  app.use("/blog", router);
  router.get("/", blogController.getAll);
  router.get("/:slug", blogController.getBlogBySlug);
  router.post("/:slug/view", blogController.increaseView);
};
