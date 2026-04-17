import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { blogs, categories } from ".";
import { relations } from "drizzle-orm";

export const categoryOnBlogs = pgTable(
    'category_on_blogs',
    {
        blog_id: uuid().references(() => blogs.id, { onDelete: "cascade" }).notNull(),
        category_id: uuid().references(() => categories.id, { onDelete: "cascade" }).notNull(),
        created_by: uuid(),
    },
    (table) => [primaryKey({ columns: [table.blog_id, table.category_id] })]
)

export const categoryOnBlogRelation = relations(categoryOnBlogs, ({ one }) => ({
    category: one(categories, { fields: [categoryOnBlogs.category_id], references: [categories.id] }),
    blog: one(blogs, { fields: [categoryOnBlogs.blog_id], references: [blogs.id] })
}))
