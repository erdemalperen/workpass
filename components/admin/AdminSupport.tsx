"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdminLayout from "./AdminLayout";
import { Search, Filter, Eye, MessageSquare, Clock, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tickets, setTickets] = useState<Array<{
    id: string;
    from: string;
    type: string;
    subject: string;
    status: "open" | "in_progress" | "resolved";
    priority: "low" | "medium" | "high";
    date: string;
    responses: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (searchQuery) params.set("search", searchQuery);
        const res = await fetch(`/api/admin/support?${params.toString()}`);
        const json = await res.json();
        if (res.ok && json.success) {
          const mapped = (json.tickets as any[]).map((t) => ({
            id: t.id,
            from: t.from,
            type: t.type,
            subject: t.subject,
            status: t.status,
            priority: t.priority,
            date: t.date,
            responses: t.responses ?? 0,
          }));
          if (mounted) setTickets(mapped);
        } else if (mounted) setTickets([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [statusFilter, searchQuery]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Total Tickets", value: tickets.length },
    { label: "Open", value: tickets.filter(t => t.status === "open").length },
    { label: "In Progress", value: tickets.filter(t => t.status === "in_progress").length },
    { label: "Resolved", value: tickets.filter(t => t.status === "resolved").length }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Support Tickets</h2>
          <p className="text-muted-foreground">Manage customer and business support requests</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <div className="py-8 text-center text-muted-foreground">Loading tickets...</div>
              ) : filteredTickets.map((ticket) => (
                <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs">{ticket.id}</Badge>
                      <Badge variant={ticket.status === "open" ? "default" : ticket.status === "in_progress" ? "secondary" : "outline"}>
                        {ticket.status === "open" && <Clock className="h-3 w-3 mr-1" />}
                        {ticket.status === "resolved" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={ticket.priority === "high" ? "destructive" : "secondary"}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline">{ticket.type}</Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{ticket.subject}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>From: <strong>{ticket.from}</strong></span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{ticket.responses} responses</span>
                      <span>Date: {new Date(ticket.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{ticket.subject}</DialogTitle>
                      </DialogHeader>
                      <AdminReplyForm ticketId={ticket.id} onSent={() => toast.success("Response sent!")} />
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function AdminReplyForm({ ticketId, onSent }: { ticketId: string; onSent: () => void }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"open" | "in_progress" | "resolved">("in_progress");
  const [isSending, setIsSending] = useState(false);
  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      setIsSending(true);
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, message, status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed");
      onSent();
      setMessage("");
    } catch (e) {
      toast.error((e as any).message ?? "Failed");
    } finally {
      setIsSending(false);
    }
  };
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Reply</label>
        <Textarea rows={4} placeholder="Write your response..." value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm">Status</label>
        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSend} className="w-full" disabled={isSending || !message.trim()}>
        {isSending ? "Sending..." : "Send Response"}
      </Button>
    </div>
  );
}
