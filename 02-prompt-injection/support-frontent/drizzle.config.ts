import { defineConfig } from "drizzle-kit";
import invariant from "tiny-invariant";
import dotenv from "dotenv";

dotenv.config();

invariant(process.env.DATABASE_URL, 'DATABASE_URL is not set');

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  schema: "./lib/schema.ts",
  out: "./drizzle",
});