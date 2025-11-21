"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ArrowLeft,
  TrendingUp,
  Calendar,
  MapPin,
  CheckCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface SavingsEntry {
  id: string;
  placeName: string;
  location: string;
  amount: number;
  date: string;
  discount: string;
  originalAmount?: number;
  discountedAmount?: number;
  passName?: string;
  category?: string;
}

interface SavingsStats {
  totalSavings: number;
  thisMonthSavings: number;
  averageSaving: number;
  totalEntries: number;
}

export default function SavingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savingsHistory, setSavingsHistory] = useState<SavingsEntry[]>([]);
  const [stats, setStats] = useState<SavingsStats>({
    totalSavings: 0,
    thisMonthSavings: 0,
    averageSaving: 0,
    totalEntries: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        const session = data.session;
        if (session?.user) {
          setIsAuthed(true);
        } else {
          router.replace("/login?redirect=/savings");
        }
      } finally {
        if (mounted) setIsChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  // Fetch savings data from API
  useEffect(() => {
    if (!isAuthed) return;

    const fetchSavings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/customer/savings");

        if (!response.ok) {
          throw new Error("Failed to fetch savings data");
        }

        const data = await response.json();
        setSavingsHistory(data.savingsHistory || []);
        setStats(data.stats || {
          totalSavings: 0,
          thisMonthSavings: 0,
          averageSaving: 0,
          totalEntries: 0,
        });
      } catch (err) {
        console.error("Error fetching savings:", err);
        setError("Unable to load savings data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavings();
  }, [isAuthed]);

  if (isChecking || !isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statsCards = [
    {
      label: "Total Savings",
      value: `₺${stats.totalSavings.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      label: "This Month",
      value: `₺${stats.thisMonthSavings.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      label: "Average Per Visit",
      value: `₺${stats.averageSaving.toFixed(2)}`,
      icon: CheckCircle,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">My Savings</h1>
            <p className="text-muted-foreground">Track how much you&apos;ve saved with TuristPass</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {statsCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Savings History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : savingsHistory.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">No savings yet</p>
                <p className="text-sm text-muted-foreground">
                  Start using your pass at partner businesses to see your savings here!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {savingsHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold">{entry.placeName}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{entry.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(entry.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {entry.discount}
                      </p>
                      {entry.passName && (
                        <p className="text-xs text-muted-foreground">
                          Used: {entry.passName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <span className="text-2xl font-bold text-green-600">
                        ₺{entry.amount.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">saved</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6 text-center space-y-3">
            <TrendingUp className="h-12 w-12 mx-auto text-primary" />
            <h3 className="text-xl font-semibold">Save Even More!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upgrade to our premium passes and unlock even bigger discounts at 70+ locations across Istanbul
            </p>
            <Button asChild size="lg">
              <Link href="/#passes-section">
                Explore Passes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
