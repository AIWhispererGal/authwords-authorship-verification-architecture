import { defineConfig } from "drizzle-kit";

// `npx drizzle-kit push` reads the same DATABASE_URL the app uses.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: { url: process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db" },
});
