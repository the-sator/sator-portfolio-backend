import { Router } from "express";
import protectedRoute from "@/authentication/protected-route";
import { CategoryController } from "../../controllers/category.controller";

const router = Router();
const categoryController = new CategoryController();

export default (app: Router) => {
  app.use("/category", router);
  router.get("/", categoryController.getCategories);
  router.post("/", protectedRoute(categoryController.createCategory));
  router.put("/:id", protectedRoute(categoryController.updateCategory));
  router.delete("/:id", protectedRoute(categoryController.deleteCategory));
};
