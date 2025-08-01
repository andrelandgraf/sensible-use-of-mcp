"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageCircle, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { SupportCase, SupportCaseMessage } from "@/lib/schema";

interface SupportCaseInterfaceProps {
  initialCases: SupportCase[];
  userId: string;
  userName: string;
}

interface ExtendedSupportCase extends SupportCase {
  messages?: SupportCaseMessage[];
}

const statusConfig = {
  open: { color: "bg-blue-500", label: "Open", icon: AlertCircle },
  in_progress: { color: "bg-yellow-500", label: "In Progress", icon: Clock },
  resolved: { color: "bg-green-500", label: "Resolved", icon: CheckCircle },
};

export function SupportCaseInterface({ initialCases, userId, userName }: SupportCaseInterfaceProps) {
  const [cases, setCases] = useState<ExtendedSupportCase[]>(initialCases);
  const [selectedCase, setSelectedCase] = useState<ExtendedSupportCase | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCaseSubject, setNewCaseSubject] = useState("");
  const [newCaseMessage, setNewCaseMessage] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();

  const createSupportCase = async () => {
    if (!newCaseSubject.trim() || !newCaseMessage.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/support-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newCaseSubject,
          initialMessage: newCaseMessage,
        }),
      });

      if (response.ok) {
        const newCase = await response.json();
        setCases(prev => [newCase, ...prev]);
        setNewCaseSubject("");
        setNewCaseMessage("");
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating support case:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCaseMessages = async (caseId: string) => {
    try {
      const response = await fetch(`/api/support-cases/${caseId}/messages`);
      if (response.ok) {
        const messages = await response.json();
        setSelectedCase(prev => prev ? { ...prev, messages } : null);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const addMessage = async () => {
    if (!newMessage.trim() || !selectedCase) return;

    try {
      const response = await fetch(`/api/support-cases/${selectedCase.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setSelectedCase(prev => prev ? {
          ...prev,
          messages: [...(prev.messages || []), newMsg]
        } : null);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error adding message:", error);
    }
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
      {/* Create New Case Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create New Support Case
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Support Case</DialogTitle>
            <DialogDescription>
              Describe your issue and we'll help you resolve it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={newCaseSubject}
                onChange={(e) => setNewCaseSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Initial Message</Label>
              <Textarea
                id="message"
                placeholder="Please provide detailed information about your issue"
                rows={4}
                value={newCaseMessage}
                onChange={(e) => setNewCaseMessage(e.target.value)}
              />
            </div>
            <Button 
              onClick={createSupportCase} 
              disabled={isLoading || !newCaseSubject.trim() || !newCaseMessage.trim()}
              className="w-full"
            >
              {isLoading ? "Creating..." : "Create Support Case"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Support Cases List */}
      <div className="grid gap-4">
        {cases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No support cases yet</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Create your first support case to get help with any issues you're experiencing.
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
              Case created on {selectedCase && formatDate(selectedCase.createdAt)}
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
                            <span className="font-medium">
                              {message.userId === userId ? userName : "Support Agent"}
                            </span>
                            <span className="text-muted-foreground">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                          <div className="bg-muted p-3 rounded-md">
                            {message.message}
                          </div>
                          {index < selectedCase.messages.length - 1 && <Separator />}
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
              {selectedCase.status !== "resolved" && (
                <div className="space-y-2">
                  <Label htmlFor="new-message">Add Message</Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="new-message"
                      placeholder="Type your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                      className="flex-1"
                    />
                    <Button 
                      onClick={addMessage}
                      disabled={!newMessage.trim()}
                      className="self-end"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}