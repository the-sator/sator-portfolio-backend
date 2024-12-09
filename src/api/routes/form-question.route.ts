import { Router } from "express";
import { FormQuestionController } from "../controllers/form-question.controller";
import protectedRoute from "@/authentication/protected-route";

const router = Router();
const formQuestionController = new FormQuestionController();

export default (app: Router) => {
  app.use("/question", router);
  router.get("/", protectedRoute(formQuestionController.findAll));
  router.post("/", protectedRoute(formQuestionController.createQuestion));
  router.delete("/:id", protectedRoute(formQuestionController.deleteQuestion));
  router.put("/:id", protectedRoute(formQuestionController.updateQuestion));
};
