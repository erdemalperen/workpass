"use client";

import { useState, useEffect } from "react";
import { supabaseAdminAuth } from "@/lib/services/supabaseAdminAuth";
import type { Admin } from "@/lib/types/admin";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  MapPin,
  ShoppingCart,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  Shield,
  Bell,
  BarChart3,
  HelpCircle,
  FileText,
  Star
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    { id: string; title: string; description: string; time: string; read: boolean }[]
  >([
    {
      id: "1",
      title: "New business application",
      description: "A new partner applied for approval.",
      time: "2m ago",
      read: false,
    },
    {
      id: "2",
      title: "Support ticket updated",
      description: "Ticket #4821 marked as resolved.",
      time: "1h ago",
      read: true,
    },
  ]);

  useEffect(() => {
    const initAuth = async () => {
      console.log('🚀 AdminLayout: Starting auth init...');

      try {
        // Check if authenticated
        console.log('1️⃣ Checking isAuthenticated...');
        const isAuth = await supabaseAdminAuth.isAuthenticated();
        console.log('isAuthenticated result:', isAuth);

        if (!isAuth) {
          console.log('❌ Not authenticated, redirecting to login');
          window.location.href = "/admin/login";
          return;
        }

        // Get admin profile
        console.log('2️⃣ Getting admin profile...');
        const adminProfile = await supabaseAdminAuth.getCurrentAdmin();
        console.log('Admin profile result:', adminProfile);

        if (!adminProfile) {
          // User is authenticated but not an admin
          console.log('❌ No admin profile found, signing out');
          await supabaseAdminAuth.signOut();
          window.location.href = "/admin/login";
          return;
        }

        console.log('✅ Admin profile loaded successfully:', adminProfile.name);
        setAdmin(adminProfile);
        setIsLoading(false);
      } catch (error) {
        console.error('💥 Auth init error:', error);
        window.location.href = "/admin/login";
      }
    };

    initAuth();
  }, []);

  // Prefetch sık kullanılan admin sayfaları
  useEffect(() => {
    router.prefetch('/admin/dashboard');
    router.prefetch('/admin/customers');
    router.prefetch('/admin/businesses');
    router.prefetch('/admin/orders');
    router.prefetch('/admin/passes');
    router.prefetch('/admin/support');
    router.prefetch('/admin/analytics');
    router.prefetch('/admin/settings');
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!admin) return null;

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, permission: null },
    { name: "Customers", href: "/admin/customers", icon: Users, permission: "customers" as const },
    { name: "Businesses", href: "/admin/businesses", icon: Building2, permission: "businesses" as const },
    { name: "Passes", href: "/admin/passes", icon: CreditCard, permission: "passes" as const },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart, permission: "orders" as const },
    { name: "Support", href: "/admin/support", icon: MessageSquare, permission: "support" as const },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: "analytics" as const },
    { name: "FAQ", href: "/admin/content/faq", icon: HelpCircle, permission: "content" as const },
    { name: "How It Works", href: "/admin/content/how-it-works", icon: FileText, permission: "content" as const },
    { name: "Why Choose Us", href: "/admin/content/why-choose-us", icon: Star, permission: "content" as const },
    { name: "Settings", href: "/admin/settings", icon: Settings, permission: "settings" as const },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredNavigation = navigation.filter(item => {
    if (!item.permission) return true;

    // Super admins have all permissions
    if (admin.role === 'super_admin') return true;

    // Check specific permission
    return admin.permissions[item.permission] === true;
  });

  const handleLogout = async () => {
    try {
      await supabaseAdminAuth.signOut();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if error
      window.location.href = "/admin/login";
    }
  };

  const closeMobile = () => setIsMobileOpen(false);

  const NavLinks = () => (
    <>
      {filteredNavigation.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={closeMobile}
            prefetch={true}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col border-r">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="font-bold text-lg">TuristPass</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          <NavLinks />
        </nav>

        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {admin.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{admin.name}</p>
              <p className="text-xs text-muted-foreground truncate">{admin.role.replace('_', ' ')}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center gap-2 border-b px-6">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="font-bold text-lg">TuristPass</h1>
                  <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
              </div>
              <nav className="flex-1 space-y-1 p-4">
                <NavLinks />
              </nav>
              <div className="border-t p-4">
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1">
            <h2 className="text-lg font-semibold md:hidden">Admin Panel</h2>
          </div>

          <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="px-3 py-2 flex items-center justify-between border-b">
                <p className="text-sm font-semibold">Notifications</p>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={markAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="px-3 py-4 text-sm text-muted-foreground">No notifications</div>
              ) : (
                <div className="max-h-80 overflow-y-auto py-1">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                      onClick={() =>
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
                        )
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{notif.title}</span>
                        {!notif.read && (
                          <span className="text-[10px] text-primary font-semibold">New</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{notif.description}</p>
                      <span className="text-[11px] text-muted-foreground">{notif.time}</span>
                    </button>
                  ))}
                </div>
              )}
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden md:flex">
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {admin.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{admin.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{admin.name}</p>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
