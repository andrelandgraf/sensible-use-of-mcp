import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";
import { supportCase, supportCaseMessage } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, initialMessage } = await request.json();
    
    if (!subject?.trim() || !initialMessage?.trim()) {
      return NextResponse.json(
        { error: "Subject and initial message are required" },
        { status: 400 }
      );
    }

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

    return NextResponse.json(newCase);
  } catch (error) {
    console.error("Error creating support case:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}