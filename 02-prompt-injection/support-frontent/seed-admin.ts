#!/usr/bin/env bun
import { db } from "./lib/db";
import { admin, apiKey } from "./lib/schema";
import { eq } from "drizzle-orm";

const ADMIN_USER_ID = "b655bedc-1b75-44a6-a9a0-fc58f9e4a6ae";

async function seedAdmin() {
  console.log("🌱 Seeding admin user and API key...");
  
  try {
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(admin)
      .where(eq(admin.userId, ADMIN_USER_ID));

    if (existingAdmin.length > 0) {
      console.log("⚠️  Admin user already exists!");
    } else {
      // Create admin user
      const [newAdmin] = await db
        .insert(admin)
        .values({
          userId: ADMIN_USER_ID,
        })
        .returning();
      
      console.log("✅ Created admin user:", newAdmin.id);
    }

    // Check if API key already exists for this user
    const existingApiKey = await db
      .select()
      .from(apiKey)
      .where(eq(apiKey.userId, ADMIN_USER_ID));

    if (existingApiKey.length > 0) {
      console.log("⚠️  API key already exists for this user!");
      console.log("🔑 Existing API Key:", existingApiKey[0].key);
    } else {
      // Create API key
      const [newApiKey] = await db
        .insert(apiKey)
        .values({
          userId: ADMIN_USER_ID,
          name: "Admin MCP Server Key",
          isActive: true,
        })
        .returning();
      
      console.log("✅ Created API key:", newApiKey.key);
      console.log("\n🚀 Use this API key to run the MCP server:");
      console.log(`npm start ${newApiKey.key}`);
    }

    console.log("\n✨ Seeding complete!");
    
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();