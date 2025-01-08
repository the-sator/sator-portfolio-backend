import { PortfolioController } from "@/api/controllers/portfolio.controller";
import protectedSiteUserRoute from "@/authentication/protected-site-user-route";
import { Router } from "express";

const router = Router();
const portfolioController = new PortfolioController();
export default (app: Router) => {
  app.use("/portfolio", router);
  router.get(
    "/",
    protectedSiteUserRoute(portfolioController.paginateBySiteUser)
  );
  router.get(
    "/:slug",
    protectedSiteUserRoute(portfolioController.findPortfolioBySlug)
  );
  router.post("/", protectedSiteUserRoute(portfolioController.createPortfolio));
  router.post(
    "/:id/publish",
    protectedSiteUserRoute(portfolioController.publishPortfolio)
  );
  router.post(
    "/:id/unpublish",
    protectedSiteUserRoute(portfolioController.unpublishPortfolio)
  );
  router.put(
    "/:id",
    protectedSiteUserRoute(portfolioController.updatePortfolio)
  );
  router.delete(
    "/:id",
    protectedSiteUserRoute(portfolioController.deletePortfolio)
  );
};
