"use client";

import { useCallback, useEffect, useState } from "react";
import { useBusinessContext } from "./BusinessLayout";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gift, AlertCircle, CheckCircle, Info, Bell } from "lucide-react";
import Link from "next/link";

type Notification = {
  id: string;
  type: "success" | "info" | "alert" | "offer";
  title: string;
  message: string;
  date: string;
  read: boolean;
};

const mapNotification = (record: any): Notification => ({
  id: String(record.id),
  type: (record.type ?? "info") as Notification["type"],
  title: record.title ?? "",
  message: record.message ?? record.content ?? "",
  date: record.date ?? record.created_at ?? new Date().toISOString(),
  read: Boolean(record.read),
});

export default function BusinessNotifications() {
  const { business, loading } = useBusinessContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!business?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/business/notifications", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load notifications");
      }
      setNotifications((json.notifications ?? []).map(mapNotification));
    } catch (err: any) {
      setError(err.message ?? "Failed to load notifications");
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [business?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!notificationId) return;

    setNotifications((current) =>
      current.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );

    try {
      await fetch("/api/business/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  }, []);

  useEffect(() => {
    if (loading || !business?.id) return;
    loadNotifications();
  }, [loading, business?.id, loadNotifications]);

  useEffect(() => {
    if (loading || !business?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`business-notifications-${business.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "business_notifications",
          filter: `business_id=eq.${business.id}`,
        },
        (payload) => {
          if (!payload.new) return;
          setNotifications((current) => {
            const mapped = mapNotification(payload.new);
            const filtered = current.filter((n) => n.id !== mapped.id);
            const next = [mapped, ...filtered];
            return next.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "business_notifications",
          filter: `business_id=eq.${business.id}`,
        },
        (payload) => {
          if (!payload.new) return;
          setNotifications((current) => {
            const mapped = mapNotification(payload.new);
            const filtered = current.filter((n) => n.id !== mapped.id);
            const next = [mapped, ...filtered];
            return next.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "business_notifications",
          filter: `business_id=eq.${business.id}`,
        },
        (payload) => {
          setNotifications((current) =>
            current.filter((n) => n.id !== String(payload.old?.id ?? "")),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loading, business?.id]);

  const getIcon = (type: Notification["type"]) => {
    const icons = { success: CheckCircle, info: Info, alert: AlertCircle, offer: Gift };
    return icons[type];
  };

  const getColor = (type: Notification["type"]) => ({
    success: "text-green-600",
    info: "text-blue-600",
    alert: "text-orange-600",
    offer: "text-purple-600",
  })[type];

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-background">
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/business/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">{business?.name ?? "Business Portal"}</p>
          </div>
          {notifications.some((n) => !n.read) && (
            <Badge>{notifications.filter((n) => !n.read).length} new</Badge>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {notifications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-2">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="font-semibold">No notifications yet</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ll let you know here when something important happens.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notif) => {
            const Icon = getIcon(notif.type);
            return (
              <Card
                key={notif.id}
                className={`${!notif.read ? "border-primary/50" : ""} cursor-pointer`}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className={`p-2 rounded-lg bg-muted ${getColor(notif.type)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{notif.title}</h3>
                        {!notif.read && <Badge variant="default">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notif.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
