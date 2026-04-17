import { relations } from "drizzle-orm";
import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { permissionFlags } from ".";
import { timestamps } from "../common";

export const resources = pgTable("resources", {
  id: uuid().defaultRandom().notNull().primaryKey(),
  name: text().unique().notNull(),
  ...timestamps,
});

export const resourceRelation = relations(resources, ({ many }) => ({
  permission_flags: many(permissionFlags),
}));
