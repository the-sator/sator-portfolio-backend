import { Router } from "express";
import siteUser from "./site-user.route";
import portfolio from "./portfolio.route";
import category from "./category.route";
import statistic from "./statistic.route";
import blog from "./blog.route";

const routes = [
  siteUser,
  portfolio,
  category,
  statistic,
  blog, // No naming collision with user/blog.route.ts
];

export default (app: Router) => {
  const router = Router();
  app.use("/site-users", router);
  routes.forEach((routeFn) => routeFn(router));
};
