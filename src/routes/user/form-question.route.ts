import { Router } from "express";
import { FormQuestionController } from "@/api/controllers/form-question.controller";

export default (app: Router) => {
  const router = Router();
  const formQuestionController = new FormQuestionController();

  app.use("/question", router);
  router.get("/:id", formQuestionController.findById);
};
