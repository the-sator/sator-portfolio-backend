import { Router } from "express";
import { PortfolioController } from "../controllers/portfolio.controller";
import protectedRoute from "@/authentication/protected-route";

const router = Router();
const portfolioController = new PortfolioController();

export default (app: Router) => {
  app.use("/portfolio", router);
  router.get("/", protectedRoute(portfolioController.findAll));
  router.get("/:slug", protectedRoute(portfolioController.findPortfolioBySlug));
  router.post("/", protectedRoute(portfolioController.createPortfolio));
};
