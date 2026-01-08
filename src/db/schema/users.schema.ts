import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { bytea, timestamps } from "../common";
import { auths } from "./auths.schema";
import { siteUsers } from "./site-users.schema";
import { roles } from "./roles.schema";

export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  username: varchar({ length: 255 }).notNull(),
  role_id: uuid()
    .references(() => roles.id)
    .notNull(),
  auth_id: uuid()
    .notNull()
    .references(() => auths.id, { onDelete: "cascade" }),
  totp_key: bytea(),
  last_login: timestamp(),
  ...timestamps,
});

export const userRelation = relations(users, ({ one, many }) => ({
  auth: one(auths, {
    fields: [users.auth_id],
    references: [auths.id],
  }),
  role: one(roles, {
    fields: [users.role_id],
    references: [roles.id],
  }),
  siteUser: many(siteUsers),
}));
