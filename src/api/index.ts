import { Router } from "express";
import user from "./routes/user.route";
import admin from "./routes/admin.route";
import role from "./routes/role.route";
import resource from "./routes/resource.route";

// guaranteed to get dependencies
export default () => {
  const app = Router();
  user(app);
  admin(app);
  role(app);
  resource(app);
  return app;
};
