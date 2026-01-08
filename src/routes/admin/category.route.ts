import { Router } from "express";
import protectedRoute from "@/core/authentication/protected-route";
import { CategoryController } from "@/api/controllers/category.controller";

const router = Router();
const categoryController = new CategoryController();

export default (app: Router) => {
  app.use("/category", router);
  router.get("/", categoryController.getCategories);
  router.post("/", protectedRoute(categoryController.createCategory));
  router.put("/:id", protectedRoute(categoryController.updateCategory));
  router.delete("/:id", protectedRoute(categoryController.deleteCategory));
};
