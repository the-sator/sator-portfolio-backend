import { z } from "zod";

export const CreatePortfolioMetricSchema = z.object({
  portfolio_id: z.string({ message: "Portfolio ID is required" }),
  view: z.number().optional(),
});

export type CreatePortfolioMetric = z.infer<typeof CreatePortfolioMetricSchema>;
