import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { bytea, timestamps } from "../common";
import { relations } from "drizzle-orm";
import { users, sessions, siteUsers } from ".";

export const auths = pgTable("auths", {
  id: uuid().defaultRandom().notNull().primaryKey(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  totp_key: bytea(),
  last_login: timestamp(),
  ...timestamps,
});

export const authsRelations = relations(auths, ({ one, many }) => ({
  user: one(users, {
    fields: [auths.id],
    references: [users.auth_id],
  }),
  site_user: one(siteUsers, {
    fields: [auths.id],
    references: [siteUsers.auth_id],
  }),
  sessions: many(sessions),
}));
