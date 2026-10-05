import { pgTable, uuid, varchar, boolean, timestamp, jsonb, integer, real, text, index } from "drizzle-orm/pg-core";

// Reference-app tables. Only synthetic data and coarse browser-derived metrics belong here.
// The production, institution-local schema is documented in the System Blueprint.
export const workspaces = pgTable("aw_workspaces", {
  id: uuid("id").primaryKey(),
  consent: boolean("consent").notNull().default(true),
  sources: jsonb("sources").$type<string[]>().notNull().default(["discussions", "timed", "drafts", "reviews"]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  consentUpdatedAt: timestamp("consent_updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("aw_workspaces_created_idx").on(table.createdAt)]);

export const submissions = pgTable("aw_submissions", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 160 }).notNull(),
  course: varchar("course", { length: 100 }).notNull(),
  source: varchar("source", { length: 40 }).notNull(),
  mode: varchar("mode", { length: 40 }).notNull().default("essay"),
  wordCount: integer("word_count").notNull(),
  score: real("score"),
  status: varchar("status", { length: 30 }).notNull(),
  flags: jsonb("flags").$type<string[]>().notNull().default([]),
  features: jsonb("features").$type<Record<string, number>>().notNull().default({}),
  seeded: boolean("seeded").notNull().default(false),
  reviewRequested: boolean("review_requested").notNull().default(false),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("aw_submissions_workspace_idx").on(table.workspaceId)]);

export const credentials = pgTable("aw_credentials", {
  id: varchar("id", { length: 64 }).primaryKey(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  submissionId: uuid("submission_id").notNull().unique().references(() => submissions.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  revoked: boolean("revoked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("aw_credentials_workspace_idx").on(table.workspaceId)]);

// Synthetic-demo keys ONLY. Production signing must use an institution-controlled HSM/KMS.
// This table is never exposed by an API. It is not a production key-management design.
export const demoSigningKeys = pgTable("aw_demo_signing_keys", {
  id: varchar("id", { length: 40 }).primaryKey(),
  privateKey: text("private_key").notNull(),
  publicKey: text("public_key").notNull(),
});
