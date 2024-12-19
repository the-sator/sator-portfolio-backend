import { Router } from "express";
import { BlogController } from "../controllers/blog.controller";
import protectedRoute from "@/authentication/protected-route";

const router = Router();
const blogController = new BlogController();

export default (app: Router) => {
  app.use("/blog", router);
  router.get("/", protectedRoute(blogController.findAll));
  router.post("/create", protectedRoute(blogController.create));
  router.put("/:id", protectedRoute(blogController.update));
  router.delete("/:id", protectedRoute(blogController.delete));
  router.put("/publish/:id", protectedRoute(blogController.publish));
  router.put("/unpublish/:id", protectedRoute(blogController.unpublish));
};
