"use client";

import { useEffect, useState } from "react";
import { useBusinessContext } from "./BusinessLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send, AlertCircle, CheckCircle, Clock, Phone, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

type BusinessTicket = {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  date: string;
  responses: number;
  lastUpdate: string;
  description: string;
};

const defaultTickets: BusinessTicket[] = [
  {
    id: "TK-001",
    subject: "QR Scanner Not Working",
    status: "resolved",
    priority: "high",
    date: "2024-10-12",
    responses: 3,
    lastUpdate: "2 days ago",
    description: "Scanner was not reading QR codes properly",
  },
  {
    id: "TK-002",
    subject: "Update Business Hours",
    status: "in_progress",
    priority: "medium",
    date: "2024-10-13",
    responses: 1,
    lastUpdate: "1 day ago",
    description: "Need to change opening hours for winter season",
  },
  {
    id: "TK-003",
    subject: "Question About Discounts",
    status: "open",
    priority: "low",
    date: "2024-10-14",
    responses: 0,
    lastUpdate: "3 hours ago",
    description: "Can we offer different discount rates?",
  },
];

export default function BusinessSupport() {
  const { business, loading } = useBusinessContext();
  const [formData, setFormData] = useState({ subject: "", message: "", priority: "medium" });
  const [tickets, setTickets] = useState<BusinessTicket[]>(defaultTickets);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (loading) return;
      try {
        setIsLoading(true);
        const res = await fetch("/api/business/support");
        const json = await res.json();
        if (res.ok && json.success) {
          const apiTickets = (json.tickets as any[]).map((t) => ({
            id: t.id,
            subject: t.subject,
            status: t.status as "open" | "in_progress" | "resolved",
            priority: t.priority as "low" | "medium" | "high",
            date: t.createdAt,
            responses: t.responses?.length ?? 0,
            lastUpdate: t.lastUpdate,
            description: "",
          }));
          if (mounted) setTickets(apiTickets);
        } else {
          if (mounted) setTickets([]);
        }
      } catch {
        if (mounted) setTickets([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">Business profile unavailable</h2>
          <p className="text-muted-foreground">
            We could not fetch your business details. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const res = await fetch("/api/business/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: formData.subject,
          priority: formData.priority,
          message: formData.message,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to submit ticket");
      toast.success("Support ticket submitted successfully!");
      setFormData({ subject: "", message: "", priority: "medium" });
      // Refresh tickets
      try {
        const r = await fetch("/api/business/support");
        const j = await r.json();
        if (r.ok && j.success) {
          const apiTickets = (j.tickets as any[]).map((t) => ({
            id: t.id,
            subject: t.subject,
            status: t.status as "open" | "in_progress" | "resolved",
            priority: t.priority as "low" | "medium" | "high",
            date: t.createdAt,
            responses: t.responses?.length ?? 0,
            lastUpdate: t.lastUpdate,
            description: "",
          }));
          setTickets(apiTickets);
        }
      } catch {}
    } catch (err: any) {
      console.error(err);
      toast.error(err.message ?? "Failed to submit ticket");
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      resolved: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-gray-600 dark:text-gray-400",
      medium: "text-yellow-600 dark:text-yellow-400",
      high: "text-red-600 dark:text-red-400"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const openTickets = tickets.filter(t => t.status === "open").length;
  const inProgressTickets = tickets.filter(t => t.status === "in_progress").length;

  return (
    <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Support Center</h2>
          <p className="text-muted-foreground">Get help and submit support tickets</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{openTickets}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inProgressTickets}</div>
              <p className="text-xs text-muted-foreground mt-1">Being handled</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="submit" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="submit">
              <Send className="h-4 w-4 mr-2" />
              Submit Ticket
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <MessageSquare className="h-4 w-4 mr-2" />
              My Tickets
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Phone className="h-4 w-4 mr-2" />
              Contact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Describe your issue and we&apos;ll get back to you as soon as possible
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject *</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="Brief description of the issue"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority *</label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Low - General question</SelectItem>
                        <SelectItem value="medium">🟡 Medium - Issue affecting work</SelectItem>
                        <SelectItem value="high">🔴 High - Critical issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message *</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Describe your issue in detail..."
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4 mt-6">
            <div className="space-y-4">
      {tickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {ticket.id}
                            </Badge>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status === "open" && <Clock className="h-3 w-3 mr-1" />}
                              {ticket.status === "in_progress" && <AlertCircle className="h-3 w-3 mr-1" />}
                              {ticket.status === "resolved" && <CheckCircle className="h-3 w-3 mr-1" />}
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end gap-2">
                          <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-3 border-t">
                        <span>Created: {new Date(ticket.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Updated: {ticket.lastUpdate}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {ticket.responses} {ticket.responses === 1 ? 'response' : 'responses'}
                        </span>
                      </div>
                      {ticket.status !== "resolved" && (
                        <Button variant="outline" className="w-full sm:w-auto">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Conversation
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Reach out to us directly
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Support</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Get help via email
                    </p>
                    <a href="mailto:business@turistpass.com" className="text-sm text-primary hover:underline">
                      business@turistpass.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone Support</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Monday - Friday, 9:00 AM - 6:00 PM
                    </p>
                    <a href="tel:+902121234567" className="text-sm text-primary hover:underline">
                      +90 (212) 123-4567
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Live Chat</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Chat with our support team
                    </p>
                    <Button variant="outline" size="sm">
                      Start Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Business Hours</h3>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday:</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Saturday:</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Sunday:</span>
                    <span className="font-medium">Closed</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
