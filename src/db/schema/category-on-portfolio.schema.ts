import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { portfolios, categories } from ".";
import { relations } from "drizzle-orm";

export const categoryOnPortfolios = pgTable(
    'category_on_portfolios',
    {
        portfolio_id: uuid().references(() => portfolios.id, { onDelete: "cascade" }).notNull(),
        category_id: uuid().references(() => categories.id, { onDelete: "cascade" }).notNull(),
        created_by: uuid(),
    },
    (table) => [primaryKey({ columns: [table.portfolio_id, table.category_id] })]
)

export const categoryOnPortfolioRelation = relations(categoryOnPortfolios, ({ one }) => ({
    category: one(categories, { fields: [categoryOnPortfolios.category_id], references: [categories.id] }),
    portfolio: one(portfolios, { fields: [categoryOnPortfolios.portfolio_id], references: [portfolios.id] })
}))
