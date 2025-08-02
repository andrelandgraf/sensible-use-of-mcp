"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Clock, CheckCircle, AlertCircle, Users } from "lucide-react";
import { SupportCase, SupportCaseMessageWithAdmin } from "@/lib/schema";
import { 
  getAllSupportCases, 
  getSupportCaseMessages, 
  addMessageToSupportCase 
} from "@/lib/support-actions";

interface AdminSupportViewProps {
  initialCases: SupportCase[];
}

interface ExtendedSupportCase extends SupportCase {
  messages?: SupportCaseMessageWithAdmin[];
  userDisplayName?: string;
}

const statusConfig = {
  open: { color: "bg-blue-500", label: "Open", icon: AlertCircle },
  in_progress: { color: "bg-yellow-500", label: "In Progress", icon: Clock },
  resolved: { color: "bg-green-500", label: "Resolved", icon: CheckCircle },
};

export function AdminSupportView({ initialCases }: AdminSupportViewProps) {
  const [cases, setCases] = useState<ExtendedSupportCase[]>(initialCases);
  const [selectedCase, setSelectedCase] = useState<ExtendedSupportCase | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const [isPending, startTransition] = useTransition();

  // Refresh cases data
  const refreshCases = async () => {
    const result = await getAllSupportCases();
    if (result.success) {
      setCases(result.data);
    } else {
      setError(result.error);
    }
  };

  const loadCaseMessages = async (caseId: string) => {
    const result = await getSupportCaseMessages(caseId);
    
    if (result.success) {
      setSelectedCase(prev => prev ? { ...prev, messages: result.data } : null);
    } else {
      setError(result.error);
    }
  };

  const handleAddMessage = () => {
    if (!newMessage.trim() || !selectedCase) return;

    startTransition(async () => {
      setError(null);
      const result = await addMessageToSupportCase(selectedCase.id, newMessage);
      
      if (result.success) {
        setSelectedCase(prev => prev ? {
          ...prev,
          messages: [...(prev.messages || []), result.data]
        } : null);
        setNewMessage("");
        // Refresh the cases list to update the timestamp
        await refreshCases();
      } else {
        setError(result.error);
      }
    });
  };

  const openCaseDetail = async (supportCase: SupportCase) => {
    setSelectedCase(supportCase);
    setIsDetailDialogOpen(true);
    await loadCaseMessages(supportCase.id);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: keyof typeof statusConfig) => {
    const Icon = statusConfig[status]?.icon || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <h2 className="text-2xl font-semibold">Admin Support Dashboard</h2>
        </div>
        <Button onClick={refreshCases} variant="outline" disabled={isPending}>
          {isPending ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Support Cases List */}
      <div className="grid gap-4">
        {cases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No support cases</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                No support cases have been created yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          cases.map((supportCase) => (
            <Card 
              key={supportCase.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openCaseDetail(supportCase)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{supportCase.subject}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`${statusConfig[supportCase.status as keyof typeof statusConfig]?.color} text-white`}
                      >
                        {getStatusIcon(supportCase.status as keyof typeof statusConfig)}
                        <span className="ml-1">
                          {statusConfig[supportCase.status as keyof typeof statusConfig]?.label}
                        </span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        User ID: {supportCase.userId.slice(0, 8)}...
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground text-right">
                    <div>Created: {formatDate(supportCase.createdAt)}</div>
                    <div>Updated: {formatDate(supportCase.updatedAt)}</div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Case Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedCase?.subject}
              {selectedCase && (
                <Badge 
                  variant="secondary" 
                  className={`${statusConfig[selectedCase.status as keyof typeof statusConfig]?.color} text-white`}
                >
                  {getStatusIcon(selectedCase.status as keyof typeof statusConfig)}
                  <span className="ml-1">
                    {statusConfig[selectedCase.status as keyof typeof statusConfig]?.label}
                  </span>
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Case created on {selectedCase && formatDate(selectedCase.createdAt)} by User ID: {selectedCase?.userId.slice(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          
          {selectedCase && (
            <div className="space-y-4">
              {/* Messages */}
              <div className="space-y-2">
                <Label>Messages</Label>
                <ScrollArea className="h-[300px] border rounded-md p-4">
                  {selectedCase.messages && selectedCase.messages.length > 0 ? (
                    <div className="space-y-4">
                      {selectedCase.messages.map((message, index) => (
                        <div key={message.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {message.isAdmin ? "Admin" : `User (${message.userId.slice(0, 8)}...)`}
                              </span>
                              {message.isAdmin && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <span className="text-muted-foreground">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                          <div className={`p-3 rounded-md ${message.isAdmin ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-muted'}`}>
                            {message.message}
                          </div>
                          {index < (selectedCase.messages?.length ?? 0) - 1 && <Separator />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Loading messages...
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Add New Message */}
              <div className="space-y-2">
                <Label htmlFor="admin-message">Reply as Admin</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="admin-message"
                    placeholder="Type your admin response here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                    className="flex-1"
                    disabled={isPending}
                  />
                  <Button 
                    onClick={handleAddMessage}
                    disabled={!newMessage.trim() || isPending}
                    className="self-end"
                  >
                    {isPending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}