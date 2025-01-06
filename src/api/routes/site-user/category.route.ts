import { CategoryController } from "@/api/controllers/category.controller";
import protectedSiteUserRoute from "@/authentication/protected-site-user-route";
import { Router } from "express";

const router = Router();
const categoryController = new CategoryController();
export default (app: Router) => {
  app.use("/category", router);
  router.get(
    "/",
    protectedSiteUserRoute(categoryController.findCategoriesBySiteUser)
  );
  router.post("/", protectedSiteUserRoute(categoryController.createCategory));
  router.put("/:id", protectedSiteUserRoute(categoryController.updateCategory));
  router.delete(
    "/:id",
    protectedSiteUserRoute(categoryController.deleteCategory)
  );
};
