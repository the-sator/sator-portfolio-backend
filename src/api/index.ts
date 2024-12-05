import { Router } from "express";
import user from "./routes/user.route";
import admin from "./routes/admin.route";
import role from "./routes/role.route";
import resource from "./routes/resource.route";
import portfolio from "./routes/portfolio.route";
import category from "./routes/category.route";

// guaranteed to get dependencies

export default () => {
  const app = Router();

  // User routes remain top-level
  user(app);

  // Admin routes group
  const adminRouter = Router();
  admin(adminRouter);
  role(adminRouter);
  resource(adminRouter);
  portfolio(adminRouter);
  category(adminRouter);
  app.use("/admin", adminRouter);

  return app;
};
