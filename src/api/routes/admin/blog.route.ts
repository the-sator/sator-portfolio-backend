import { Router } from "express";
import { BlogController } from "../../controllers/blog.controller";
import protectedRoute from "@/authentication/protected-route";

const router = Router();
const blogController = new BlogController();

export default (app: Router) => {
  app.use("/blog", router);
  router.get("/", protectedRoute(blogController.paginateByAdmin));
  router.get("/all", protectedRoute(blogController.findAll));
  router.get("/:slug", protectedRoute(blogController.findBlogBySlug));
  router.post("/", protectedRoute(blogController.create));
  router.post("/:id/publish", protectedRoute(blogController.publish));
  router.post("/:id/unpublish", protectedRoute(blogController.unpublish));
  router.delete("/:id", protectedRoute(blogController.delete));
  router.put("/:id", protectedRoute(blogController.update));
};
