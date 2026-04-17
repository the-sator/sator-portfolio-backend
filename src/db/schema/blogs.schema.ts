import { json, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "../common";
import { relations } from "drizzle-orm";
import { categoryOnBlogs, siteUsers } from ".";

export const blogs = pgTable("blogs", {
  id: uuid().defaultRandom().notNull().primaryKey(),
  published_at: timestamp(),
  slug: text().unique().notNull(),
  title: text().notNull(),
  content: json(),
  cover_url: text(),
  description: text().notNull(),
  site_user_id: uuid().references(() => siteUsers.id),
  ...timestamps,
});

export const blogRelation = relations(blogs, ({ one, many }) => ({
  site_user: one(siteUsers, {
    fields: [blogs.site_user_id],
    references: [siteUsers.id],
  }),
  category_on_blogs: many(categoryOnBlogs),
}));
