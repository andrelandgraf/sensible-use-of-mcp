"use server";

import { db } from "./db";
import { supportCase, supportCaseMessage, admin } from "./schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { stackServerApp } from "@/stack";
import { redirect } from "next/navigation";
import { isUserAdmin } from "./api-auth";

export async function getSupportCases() {
  try {
    const user = await stackServerApp.getUser({ or: 'redirect' });
    const cases = await db
      .select()
      .from(supportCase)
      .where(eq(supportCase.userId, user.id))
      .orderBy(desc(supportCase.updatedAt));

    return { success: true, data: cases };
  } catch (error) {
    console.error("Error fetching support cases:", error);
    return { success: false, error: "Failed to fetch support cases" };
  }
}

export async function createSupportCase(subject: string, initialMessage: string) {
  try {
    if (!subject?.trim() || !initialMessage?.trim()) {
      return { success: false, error: "Subject and initial message are required" };
    }

    const user = await stackServerApp.getUser({ or: 'redirect' });

    // Create the support case
    const [newCase] = await db
      .insert(supportCase)
      .values({
        userId: user.id,
        subject: subject.trim(),
        status: "open",
      })
      .returning();

    // Create the initial message
    await db.insert(supportCaseMessage).values({
      supportCaseId: newCase.id,
      userId: user.id,
      message: initialMessage.trim(),
    });

    revalidatePath("/");
    return { success: true, data: newCase };
  } catch (error) {
    console.error("Error creating support case:", error);
    return { success: false, error: "Failed to create support case" };
  }
}

export async function getSupportCaseMessages(caseId: string) {
  try {
    const user = await stackServerApp.getUser({ or: 'redirect' });
    const userIsAdmin = await isUserAdmin(user.id);

    // Verify the case exists
    const [case_] = await db
      .select()
      .from(supportCase)
      .where(eq(supportCase.id, caseId));

    if (!case_) {
      return { success: false, error: "Support case not found" };
    }

    // Allow access if user owns the case or is an admin
    if (case_.userId !== user.id && !userIsAdmin) {
      return { success: false, error: "Unauthorized access to support case" };
    }

    // Fetch messages for the support case with admin information
    const messages = await db
      .select({
        id: supportCaseMessage.id,
        supportCaseId: supportCaseMessage.supportCaseId,
        userId: supportCaseMessage.userId,
        message: supportCaseMessage.message,
        createdAt: supportCaseMessage.createdAt,
        isAdmin: admin.userId,
      })
      .from(supportCaseMessage)
      .leftJoin(admin, eq(supportCaseMessage.userId, admin.userId))
      .where(eq(supportCaseMessage.supportCaseId, caseId))
      .orderBy(supportCaseMessage.createdAt);

    // Transform the data to include a boolean isAdmin field
    const messagesWithAdminStatus = messages.map(msg => ({
      ...msg,
      isAdmin: !!msg.isAdmin, // Convert to boolean - true if admin record exists
    }));

    return { success: true, data: messagesWithAdminStatus };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, error: "Failed to fetch messages" };
  }
}

export async function addMessageToSupportCase(caseId: string, message: string) {
  try {
    if (!message?.trim()) {
      return { success: false, error: "Message is required" };
    }

    const user = await stackServerApp.getUser({ or: 'redirect' });
    const userIsAdmin = await isUserAdmin(user.id);

    // Verify the case exists
    const [case_] = await db
      .select()
      .from(supportCase)
      .where(eq(supportCase.id, caseId));

    if (!case_) {
      return { success: false, error: "Support case not found" };
    }

    // Allow access if user owns the case or is an admin
    if (case_.userId !== user.id && !userIsAdmin) {
      return { success: false, error: "Unauthorized access to support case" };
    }

    // Create the new message
    const [newMessage] = await db
      .insert(supportCaseMessage)
      .values({
        supportCaseId: caseId,
        userId: user.id,
        message: message.trim(),
      })
      .returning();

    const messageWithAdminStatus = {
      ...newMessage,
      isAdmin: userIsAdmin,
    };

    // Update the support case's updatedAt timestamp
    await db
      .update(supportCase)
      .set({ updatedAt: new Date() })
      .where(eq(supportCase.id, caseId));

    revalidatePath("/");
    return { success: true, data: messageWithAdminStatus };
  } catch (error) {
    console.error("Error adding message:", error);
    return { success: false, error: "Failed to add message" };
  }
}

// Admin-specific functions
export async function getAllSupportCases() {
  try {
    const user = await stackServerApp.getUser({ or: 'redirect' });
    const userIsAdmin = await isUserAdmin(user.id);
    
    if (!userIsAdmin) {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    // Get all support cases
    const cases = await db
      .select()
      .from(supportCase)
      .orderBy(desc(supportCase.updatedAt));

    return { success: true, data: cases };
  } catch (error) {
    console.error("Error fetching all support cases:", error);
    return { success: false, error: "Failed to fetch support cases" };
  }
}

export async function checkIsAdmin() {
  try {
    const user = await stackServerApp.getUser({ or: 'redirect' });
    const userIsAdmin = await isUserAdmin(user.id);
    return { success: true, data: userIsAdmin };
  } catch (error) {
    console.error("Error checking admin status:", error);
    return { success: false, error: "Failed to check admin status" };
  }
}

export async function logout() {
  const user = await stackServerApp.getUser({ or: 'redirect' });
  await user.signOut();
  redirect('/handler/sign-in');
}