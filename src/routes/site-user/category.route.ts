import { CategoryController } from "@/api/controllers/category.controller";
import protectedSiteUserRoute from "@/core/authentication/protected-site-user-route";
import { Router } from "express";

export default (app: Router) => {
  const router = Router();
  const categoryController = new CategoryController();

  app.use("/category", router);
  router.get(
    "/",
    protectedSiteUserRoute(categoryController.findCategoriesBySiteUser),
  );
  router.post("/", protectedSiteUserRoute(categoryController.createCategory));
  router.put("/:id", protectedSiteUserRoute(categoryController.updateCategory));
  router.delete(
    "/:id",
    protectedSiteUserRoute(categoryController.deleteCategory),
  );
};
