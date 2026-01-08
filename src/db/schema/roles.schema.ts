import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "../common";
import { relations } from "drizzle-orm";
import { users, permissionFlags } from ".";

export const roles = pgTable("roles", {
  id: uuid().defaultRandom().notNull().primaryKey(),
  name: varchar({ length: 255 }).unique().notNull(),
  ...timestamps,
});

export const roleRelation = relations(roles, ({ many }) => ({
  users: many(users),
  permission_flags: many(permissionFlags),
}));
