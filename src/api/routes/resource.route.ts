import { Router } from "express";
import { ResourceController } from "../controllers/resource.controller";
import protectedRoute from "@/authentication/protected-route";

const router = Router();
const resourceController = new ResourceController();
export default (app: Router) => {
  app.use("/admin/resource", router);
  router.get("/", protectedRoute(resourceController.getResources));
  router.get("/", protectedRoute(resourceController.getResources));
};
