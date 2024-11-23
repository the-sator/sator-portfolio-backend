import { Router } from "express";
import user from "./routes/user.route";
import admin from "./routes/admin.route";

// guaranteed to get dependencies
export default () => {
  const app = Router();
  user(app);
  admin(app);
  return app;
};
