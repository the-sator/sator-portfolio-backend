import { Router } from "express";
import { FormAttemptController } from "../controllers/form-attempt.controller";

const router = Router();
const formAttemptController = new FormAttemptController();

export default (app: Router) => {
  app.use("/form-attempt", router);
  // router.get("/", formAttemptController.findByUser);
  router.get("/", formAttemptController.paginateByUser);
  router.get("/:id", formAttemptController.getAttemptById);
  router.post("/", formAttemptController.create);
  router.post("/:id/bring-to-life", formAttemptController.bringItToLife);
};
