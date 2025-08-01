import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";
import { supportCase, supportCaseMessage } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the support case belongs to the user
    const [case_] = await db
      .select()
      .from(supportCase)
      .where(
        and(
          eq(supportCase.id, id),
          eq(supportCase.userId, user.id)
        )
      );

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
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { message } = await request.json();
    
    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Verify the support case belongs to the user
    const [case_] = await db
      .select()
      .from(supportCase)
      .where(
        and(
          eq(supportCase.id, id),
          eq(supportCase.userId, user.id)
        )
      );

    if (!case_) {
      return NextResponse.json(
        { error: "Support case not found" },
        { status: 404 }
      );
    }

    // Check if case is resolved (optional - you might want to allow messages on resolved cases)
    if (case_.status === "resolved") {
      return NextResponse.json(
        { error: "Cannot add messages to resolved cases" },
        { status: 400 }
      );
    }

    // Create the new message
    const [newMessage] = await db
      .insert(supportCaseMessage)
      .values({
        supportCaseId: id,
        userId: user.id,
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