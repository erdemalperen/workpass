"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  QrCode,
  History,
  Store,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X,
  Star,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BusinessLayoutProps {
  children: React.ReactNode;
}

interface BusinessAccount {
  id: string;
  business_id: string | null;
  business_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string | null;
  metadata?: Record<string, any>;
}

interface BusinessRecord {
  id: string;
  name: string | null;
  slug: string | null;
  category: string | null;
  status: string | null;
  description: string | null;
  short_description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  email: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  city: string | null;
  district: string | null;
  tax_number: string | null;
  registration_number: string | null;
  established: string | null;
  website: string | null;
  created_at?: string;
  updated_at?: string;
}

interface BusinessContextValue {
  account: BusinessAccount | null;
  business: BusinessRecord | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

export function useBusinessContext() {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error("useBusinessContext must be used within BusinessLayout");
  }
  return ctx;
}

export default function BusinessLayout({ children }: BusinessLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [state, setState] = useState<{
    loading: boolean;
    account: BusinessAccount | null;
    business: BusinessRecord | null;
    error: string | null;
  }>({
    loading: true,
    account: null,
    business: null,
    error: null,
  });

  const fetchAccount = useCallback(async () => {
    // Login sayfasında API çağrısı yapma
    if (pathname === "/business/login") {
      setState({
        loading: false,
        account: null,
        business: null,
        error: null,
      });
      return;
    }

    // İlk mount ya da manuel refresh'te yükleme göster
    setState((prev) => ({ ...prev, loading: prev.account ? false : true, error: null }));
    try {
      const response = await fetch("/api/business/account");
      if (response.status === 401) {
        const current = typeof window !== 'undefined' ? window.location.pathname : pathname || '';
        const redirect = current ? `?redirect=${encodeURIComponent(current)}` : "";
        router.replace(`/business/login${redirect}`);
        return;
      }

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to load business account");
      }

      setState({
        loading: false,
        account: result.account,
        business: result.account?.business ?? null,
        error: null,
      });
    } catch (error: any) {
      console.error("Failed to fetch business account", error);
      setState({
        loading: false,
        account: null,
        business: null,
        error: error.message ?? "Failed to load business data",
      });
    }
  }, [router, pathname]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await fetchAccount();
    })();
    return () => {
      mounted = false;
    };
  }, [fetchAccount]);

  // Prefetch sık kullanılan sayfalar (algısal hız artışı)
  useEffect(() => {
    router.prefetch('/business/dashboard');
    router.prefetch('/business/profile');
    router.prefetch('/business/history');
    router.prefetch('/business/scanner');
    router.prefetch('/business/reviews');
    router.prefetch('/business/support');
  }, [router]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/business/login");
  }, [router, supabase]);

  const contextValue = useMemo<BusinessContextValue>(
    () => ({
      account: state.account,
      business: state.business,
      loading: state.loading,
      refresh: fetchAccount,
    }),
    [state.account, state.business, state.loading, fetchAccount],
  );

  // Login sayfasında sadece children'ı render et, layout gösterme
  if (pathname === "/business/login") {
    return <>{children}</>;
  }

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (state.error || !state.account || !state.business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 text-center">
        <div className="space-y-4 max-w-md">
          <h2 className="text-2xl font-semibold">Business account not ready</h2>
          <p className="text-muted-foreground">
            {state.error ??
              "We could not find a linked business profile for this account. Please contact support or complete the onboarding steps."}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={fetchAccount}>Retry</Button>
            <Button variant="outline" onClick={handleLogout}>
              Return to login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const business = state.business;
  const venueName = business.name ?? state.account.business_name ?? "My Venue";
  const venueDistrict = business.district ?? business.city ?? "—";

  const navigation = [
    { name: "Dashboard", href: "/business/dashboard", icon: LayoutDashboard },
    { name: "Scanner", href: "/business/scanner", icon: QrCode },
    { name: "History", href: "/business/history", icon: History },
    { name: "My Venue", href: "/business/profile", icon: Store },
    { name: "Reviews", href: "/business/reviews", icon: Star },
    { name: "Support", href: "/business/support", icon: MessageSquare },
  ];

  const notifications = [
    {
      id: 1,
      title: "New pass scanned",
      message: "A customer used their pass successfully",
      time: "5 mins ago",
      unread: true,
    },
    {
      id: 2,
      title: "New review",
      message: "You received a 5-star review",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "System update",
      message: "New features available in dashboard",
      time: "2 hours ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <BusinessContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <Link href="/business/dashboard" className="flex flex-col">
                <span className="text-lg font-bold text-primary">TuristPass</span>
                <span className="text-xs text-muted-foreground font-medium">
                  Business Portal
                </span>
              </Link>
            </div>

            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Venue</p>
              <p className="font-semibold text-sm truncate">{venueName}</p>
              <p className="text-xs text-muted-foreground mt-1">{venueDistrict}</p>
              {business.status && (
                <Badge variant={business.status === "active" ? "default" : "secondary"} className="mt-2">
                  {business.status}
                </Badge>
              )}
            </div>

            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            prefetch
                            className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                              isActive
                                ? "bg-primary text-white"
                                : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
                <li className="mt-auto">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 shadow-sm sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            <div className="flex flex-1 items-center gap-x-4 justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-[10px] font-semibold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72" align="end">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">Notifications</p>
                  </div>
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        {notification.time}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {venueName
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase() ?? "")
                        .join("")}
                    </span>
                    <span className="flex flex-col items-start">
                      <span className="text-sm font-semibold leading-none">{venueName}</span>
                      {business.status && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {business.status}
                        </span>
                      )}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/business/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/business/history">Visit history</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="lg:hidden">
            <div
              className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${
                isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              onClick={() => setIsSidebarOpen(false)}
            />
            <div
              className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-950 shadow-lg transform transition-transform ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <span className="text-lg font-bold text-primary">TuristPass</span>
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="px-4 py-6 space-y-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
                <Button
                  variant="outline"
                  className="w-full mt-6 justify-start gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </nav>
            </div>
          </div>

          <main className="py-8">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </BusinessContext.Provider>
  );
}
