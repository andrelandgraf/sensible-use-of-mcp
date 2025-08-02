import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supportCase, supportCaseMessage } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { authenticateAdminApiRequest } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateAdminApiRequest(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;

    // Admin can access any support case
    const [case_] = await db
      .select()
      .from(supportCase)
      .where(eq(supportCase.id, id));

    if (!case_) {
      return NextResponse.json(
        { error: "Support case not found" },
        { status: 404 }
      );
    }

    // Fetch messages for the support case
    const messages = await db
      .select()
      .from(supportCaseMessage)
      .where(eq(supportCaseMessage.supportCaseId, id))
      .orderBy(supportCaseMessage.createdAt);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateAdminApiRequest(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

    const { id } = await params;
    const { message } = await request.json();
    
    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Admin can reply to any support case
    const [case_] = await db
      .select()
      .from(supportCase)
      .where(eq(supportCase.id, id));

    if (!case_) {
      return NextResponse.json(
        { error: "Support case not found" },
        { status: 404 }
      );
    }

    // Create the new message
    const [newMessage] = await db
      .insert(supportCaseMessage)
      .values({
        supportCaseId: id,
        userId: user.userId,
        message: message.trim(),
      })
      .returning();

    // Update the support case's updatedAt timestamp
    await db
      .update(supportCase)
      .set({ updatedAt: new Date() })
      .where(eq(supportCase.id, id));

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}