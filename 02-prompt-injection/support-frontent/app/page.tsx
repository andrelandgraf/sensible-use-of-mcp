import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";
import { supportCase, supportCaseMessage } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { SupportCaseInterface } from "./support-case-interface";

export default async function Home() {
  const user = await stackServerApp.getUser({ or: 'redirect' });
  
  // Fetch user's support cases
  const userSupportCases = await db
    .select()
    .from(supportCase)
    .where(eq(supportCase.userId, user.id))
    .orderBy(desc(supportCase.createdAt));

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Support Center</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user.displayName || user.primaryEmail}
          </p>
        </div>
      </div>
      
      <SupportCaseInterface 
        initialCases={userSupportCases} 
        userId={user.id}
        userName={user.displayName || user.primaryEmail || "User"}
      />
    </div>
  );
}
