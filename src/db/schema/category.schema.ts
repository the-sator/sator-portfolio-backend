import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { enumToPgEnum, timestamps } from "../common";
import { CategoryColorEnum } from "@/modules/category/model/category.enum";
import { categoryOnBlogs, categoryOnPortfolios, siteUsers } from ".";
import { relations } from "drizzle-orm";
export const categoryColorEnum = pgEnum(
  "CategoryColorEnum",
  enumToPgEnum(CategoryColorEnum)
);
export const categories = pgTable("categories", {
  id: uuid().defaultRandom().notNull().primaryKey(),
  name: text().notNull(),
  color: categoryColorEnum().default(CategoryColorEnum.BLUE),
  site_user_id: uuid().references(() => siteUsers.id),
  ...timestamps,
});

export const categoryRelation = relations(categories, ({ one, many }) => ({
  siteUser: one(siteUsers, {
    fields: [categories.site_user_id],
    references: [siteUsers.id],
  }),
  category_on_blog: many(categoryOnBlogs),
  category_on_portfolio: many(categoryOnPortfolios),
}));
