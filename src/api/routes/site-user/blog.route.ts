import { BlogController } from "@/api/controllers/blog.controller";
import protectedSiteUserRoute from "@/authentication/protected-site-user-route";
import { Router } from "express";

const router = Router();
const blogController = new BlogController();
export default (app: Router) => {
  app.use("/blog", router);
  router.get("/", protectedSiteUserRoute(blogController.paginateBySiteUser));
  router.get("/published", blogController.paginateBySiteUserApiKey);
  router.get("/:slug", protectedSiteUserRoute(blogController.findBlogBySlug));
  router.post("/:slug/view", blogController.increaseView);
  router.post("/", protectedSiteUserRoute(blogController.create));
  router.post("/:id/publish", protectedSiteUserRoute(blogController.publish));
  router.post(
    "/:id/unpublish",
    protectedSiteUserRoute(blogController.unpublish)
  );
  router.delete("/:id", protectedSiteUserRoute(blogController.delete));
  router.put("/:id", protectedSiteUserRoute(blogController.update));
};
