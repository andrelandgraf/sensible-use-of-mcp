import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supportCase, supportCaseMessage } from "@/lib/schema";
import { authenticateAdminApiRequest } from "@/lib/api-auth";
import { desc } from "drizzle-orm";

// GET all support cases (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateAdminApiRequest(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const cases = await db
      .select()
      .from(supportCase)
      .orderBy(desc(supportCase.updatedAt));

    return NextResponse.json(cases);
  } catch (error) {
    console.error("Error fetching support cases:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateAdminApiRequest(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { user } = authResult;

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
        userId: user.userId,
        subject: subject.trim(),
        status: "open",
      })
      .returning();

    // Create the initial message
    await db.insert(supportCaseMessage).values({
      supportCaseId: newCase.id,
      userId: user.userId,
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