import { db } from "@/lib/db";
import { applications, logs, traces } from "@/lib/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Database, FileText, Zap } from "lucide-react";
import { desc } from "drizzle-orm";

async function getApplications() {
  return await db.select().from(applications);
}

async function getLogs() {
  return await db.select().from(logs).orderBy(desc(logs.createdAt)).limit(50);
}

async function getTraces() {
  return await db.select().from(traces).orderBy(desc(traces.createdAt)).limit(50);
}

function getLogBadgeVariant(type: string) {
  switch (type) {
    case 'error':
      return 'destructive';
    case 'warn':
      return 'secondary';
    case 'info':
      return 'default';
    case 'debug':
      return 'outline';
    default:
      return 'default';
  }
}

function formatTimestamp(timestamp: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp));
}

export default async function Dashboard() {
  const [applicationsData, logsData, tracesData] = await Promise.all([
    getApplications(),
    getLogs(),
    getTraces()
  ]);

  return (
    <div className="min-h-screen zen-gradient">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-full">
              <Activity className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Zen-tree
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A mindful error tracing and logging dashboard. Find peace in your debugging journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applicationsData.length}</div>
              <p className="text-xs text-muted-foreground">Active applications</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Logs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logsData.length}</div>
              <p className="text-xs text-muted-foreground">Last 50 entries</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Traces</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tracesData.length}</div>
              <p className="text-xs text-muted-foreground">Last 50 entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="traces">Traces</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Logs
                </CardTitle>
                <CardDescription>
                  Latest log entries across all applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logsData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No logs found. Start logging to see entries here.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>App ID</TableHead>
                          <TableHead>Correlation ID</TableHead>
                          <TableHead>Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logsData.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Badge variant={getLogBadgeVariant(log.type)}>
                                {log.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {log.message}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.applicationId}</Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {log.correlationId}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatTimestamp(log.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Traces Tab */}
          <TabsContent value="traces" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Recent Traces
                </CardTitle>
                <CardDescription>
                  Latest trace entries across all applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tracesData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No traces found. Start tracing to see entries here.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Trace</TableHead>
                          <TableHead>App ID</TableHead>
                          <TableHead>Correlation ID</TableHead>
                          <TableHead>Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tracesData.map((trace) => (
                          <TableRow key={trace.id}>
                            <TableCell className="max-w-xs truncate font-mono text-sm">
                              {trace.trace}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{trace.applicationId}</Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {trace.correlationId}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatTimestamp(trace.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Applications
                </CardTitle>
                <CardDescription>
                  All registered applications in your logging system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicationsData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No applications found. Register your first application to get started.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {applicationsData.map((app) => (
                      <Card key={app.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{app.name}</CardTitle>
                            <Badge variant="secondary">ID: {app.id}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div>Created: {formatTimestamp(app.createdAt)}</div>
                            <div>Updated: {formatTimestamp(app.updatedAt)}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
