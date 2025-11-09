"use client";

import { useEffect, useState } from "react";
import { useBusinessContext } from "./BusinessLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gift, AlertCircle, CheckCircle, Info } from "lucide-react";
import Link from "next/link";

type Notification = {
  id: string;
  type: "success" | "info" | "alert" | "offer";
  title: string;
  message: string;
  date: string;
  read: boolean;
};

const defaultNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "New Customer Visit",
    message: "A TuristPass customer just redeemed their discount at your venue.",
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: "2",
    type: "info",
    title: "Platform Update",
    message: "New analytics widgets are now available in your dashboard.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    read: false,
  },
  {
    id: "3",
    type: "alert",
    title: "Profile Reminder",
    message: "Add opening hours to your profile to improve visibility.",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
];

export default function BusinessNotifications() {
  const { business, loading } = useBusinessContext();
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (loading) return;
      try {
        setIsLoading(true);
        const res = await fetch("/api/business/notifications");
        const json = await res.json();
        if (res.ok && json.success) {
          if (mounted) setNotifications(json.notifications);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loading]);

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
        {notifications.map((notif) => {
          const Icon = getIcon(notif.type);
          return (
            <Card key={notif.id} className={!notif.read ? "border-primary/50" : ""}>
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
        })}
      </div>
    </div>
  );
}
