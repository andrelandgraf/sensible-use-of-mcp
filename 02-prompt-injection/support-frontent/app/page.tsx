import { stackServerApp } from "@/stack";
import { getSupportCases, getAllSupportCases, checkIsAdmin, logout } from "@/lib/support-actions";
import { SupportCaseDialog } from "@/components/support-case-dialog";
import { AdminSupportView } from "@/components/admin-support-view";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const user = await stackServerApp.getUser({ or: 'redirect' });
  
  // Check if user is admin
  const adminResult = await checkIsAdmin();
  const isAdmin = adminResult.success ? adminResult.data : false;

  // Fetch appropriate support cases based on admin status
  let supportCases = [];
  if (isAdmin) {
    const allCasesResult = await getAllSupportCases();
    supportCases = allCasesResult.success ? (allCasesResult.data || []) : [];
  } else {
    const userCasesResult = await getSupportCases();
    supportCases = userCasesResult.success ? (userCasesResult.data || []) : [];
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? "Admin Support Center" : "Support Center"}
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user.displayName || user.primaryEmail}
            {isAdmin && <span className="ml-2 text-blue-600 font-medium">(Administrator)</span>}
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline">
            Logout
          </Button>
        </form>
      </div>
      
      {isAdmin ? (
        <AdminSupportView initialCases={supportCases} />
      ) : (
        <SupportCaseDialog 
          initialCases={supportCases} 
          userId={user.id}
          userName={user.displayName || user.primaryEmail || "User"}
        />
      )}
    </div>
  );
}
