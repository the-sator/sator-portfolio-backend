import { Router } from "express";
import { TestController } from "../controllers/test.controller";

const router = Router();
const test = new TestController();
export default (app: Router) => {
  app.use("/test", router);
  router.get("/", test.getAll);
  router.post("/", test.create);
  router.put("/:id", test.update);
};
