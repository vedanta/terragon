import { randomUUID } from "node:crypto";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

const uuid = () => randomUUID();

/* ---- Auth.js standard tables ---- */

export const users = pgTable("user", {
  id: text("id").primaryKey().$defaultFn(uuid),
  name: text("name"),
  // Nullable: GitHub users with a private email return no email at sign-in.
  email: text("email"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

/* ---- Terragon app tables (architecture §5) ---- */

export const repositories = pgTable("repository", {
  id: text("id").primaryKey().$defaultFn(uuid),
  githubRepoId: text("github_repo_id").notNull().unique(),
  owner: text("owner").notNull(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  private: boolean("private").notNull().default(false),
  defaultBranch: text("default_branch"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const userRepositories = pgTable("user_repository", {
  id: text("id").primaryKey().$defaultFn(uuid),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repositories.id, { onDelete: "cascade" }),
  role: text("role"),
  lastOpenedAt: timestamp("last_opened_at", { mode: "date" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const workspaceSettings = pgTable("workspace_settings", {
  id: text("id").primaryKey().$defaultFn(uuid),
  repositoryId: text("repository_id")
    .notNull()
    .unique()
    .references(() => repositories.id, { onDelete: "cascade" }),
  labelPlanned: text("label_planned").notNull().default("terragon/planned"),
  labelInProgress: text("label_in_progress")
    .notNull()
    .default("terragon/in-progress"),
  labelDone: text("label_done").notNull().default("terragon/done"),
  labelBackburner: text("label_backburner")
    .notNull()
    .default("terragon/backburner"),
  autoCloseDone: boolean("auto_close_done").notNull().default(true),
  accent: text("accent").notNull().default("#5b5bd6"),
  defaultTheme: text("default_theme").notNull().default("light"),
  compactCards: boolean("compact_cards").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const syncEvents = pgTable("sync_event", {
  id: text("id").primaryKey().$defaultFn(uuid),
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repositories.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  status: text("status").notNull(),
  payload: text("payload"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
