import protectedSiteUserRoute from "@/core/authentication/protected-site-user-route";
import { BlogController } from "@/modules/blog/blog.controller";
import { Router } from "express";

export default (app: Router) => {
  const router = Router();
  const blogController = new BlogController();

  app.use("/blog", router);
  router.get("/", protectedSiteUserRoute(blogController.paginateBySiteUser));
  router.get("/published", blogController.paginateBySiteUserApiKey);
  router.get("/all/published", blogController.getAllPublishedSlug);
  router.get("/:slug", protectedSiteUserRoute(blogController.getBlogBySlug));
  router.get("/:slug/published", blogController.getPublishedBlogBySlug);
  router.post("/:slug/view", blogController.increaseView);
  router.post("/", protectedSiteUserRoute(blogController.create));
  router.post("/:id/publish", protectedSiteUserRoute(blogController.publish));
  router.post(
    "/:id/unpublish",
    protectedSiteUserRoute(blogController.unpublish),
  );
  router.delete("/:id", protectedSiteUserRoute(blogController.delete));
  router.put("/:id", protectedSiteUserRoute(blogController.update));
};
