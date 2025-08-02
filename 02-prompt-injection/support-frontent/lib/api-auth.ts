import { NextRequest } from "next/server";
import { db } from "./db";
import { apiKey, admin } from "./schema";
import { eq, and } from "drizzle-orm";

/**
 * Extract API key from request headers
 */
export function getApiKeyFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}

/**
 * Verify API key and return user info if valid
 */
export async function verifyApiKey(key: string) {
  try {
    const [keyRecord] = await db
      .select({
        userId: apiKey.userId,
        isActive: apiKey.isActive,
        keyId: apiKey.id,
      })
      .from(apiKey)
      .where(and(eq(apiKey.key, key), eq(apiKey.isActive, true)));

    if (!keyRecord) {
      return null;
    }

    // Update last used timestamp
    await db
      .update(apiKey)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKey.id, keyRecord.keyId));

    return {
      userId: keyRecord.userId,
    };
  } catch (error) {
    console.error("Error verifying API key:", error);
    return null;
  }
}

/**
 * Check if a user is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const [adminRecord] = await db
      .select()
      .from(admin)
      .where(eq(admin.userId, userId));

    return !!adminRecord;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Verify API key belongs to an admin user
 */
export async function verifyAdminApiKey(key: string) {
  const user = await verifyApiKey(key);
  if (!user) {
    return null;
  }

  const isAdmin = await isUserAdmin(user.userId);
  if (!isAdmin) {
    return null;
  }

  return user;
}

/**
 * Middleware helper to authenticate API requests
 */
export async function authenticateApiRequest(request: NextRequest) {
  const apiKeyValue = getApiKeyFromRequest(request);
  if (!apiKeyValue) {
    return { error: "Missing API key", status: 401 };
  }

  const user = await verifyApiKey(apiKeyValue);
  if (!user) {
    return { error: "Invalid API key", status: 401 };
  }

  return { user };
}

/**
 * Middleware helper to authenticate admin API requests
 */
export async function authenticateAdminApiRequest(request: NextRequest) {
  const apiKeyValue = getApiKeyFromRequest(request);
  if (!apiKeyValue) {
    return { error: "Missing API key", status: 401 };
  }

  const user = await verifyAdminApiKey(apiKeyValue);
  if (!user) {
    return { error: "Invalid admin API key", status: 401 };
  }

  return { user };
}