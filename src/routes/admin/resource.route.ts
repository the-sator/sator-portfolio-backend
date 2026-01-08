import { Router } from "express";
import { ResourceController } from "@/api/controllers/resource.controller";
import protectedRoute from "@/core/authentication/protected-route";

const router = Router();
const resourceController = new ResourceController();
export default (app: Router) => {
  app.use("/resource", router);
  router.get("/", protectedRoute(resourceController.getResources));
};
