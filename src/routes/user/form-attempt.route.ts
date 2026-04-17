import { Router } from "express";
import { FormAttemptController } from "@/api/controllers/form-attempt.controller";

export default (app: Router) => {
  const router = Router();
  const formAttemptController = new FormAttemptController();

  app.use("/form-attempt", router);
  // router.get("/", formAttemptController.findByUser);
  router.get("/", formAttemptController.paginateByUser);
  router.get("/:id", formAttemptController.getAttemptById);
  router.post("/", formAttemptController.create);
  // router.post("/:id/bring-to-life", formAttemptController.bringItToLife);
};
