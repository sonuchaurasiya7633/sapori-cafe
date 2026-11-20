'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  UtensilsCrossed,
  Layers,
  Calendar,
  Tag,
  MessageSquare,
  Sliders,
  ShieldCheck,
  Menu as MenuIcon,
  X,
  ExternalLink,
  QrCode,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  Globe,
  KeyRound,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { toast } from '@/lib/toast';
import ChangeCredentialsModal from '@/components/admin/ChangeCredentialsModal';
import RealtimeNotificationBanner from '@/components/admin/RealtimeNotificationBanner';

interface AdminNotificationItem {
  id: string;
  orderNumber: string;
  orderMode: string;
  total: number;
  customerName: string;
  status: string;
  timestamp: number;
}

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@saporicafe.in');
  const [globalSearch, setGlobalSearch] = useState('');

  // Live order notifications & unread badge state
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activePendingCount, setActivePendingCount] = useState<number>(0);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    const q = globalSearch.trim();
    if (q.toUpperCase().startsWith('SAP-RES') || q.toUpperCase().startsWith('RES')) {
      router.push(`/admin/reservations?search=${encodeURIComponent(q)}`);
    } else {
      router.push(`/admin/orders?search=${encodeURIComponent(q)}`);
    }
  };

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
  }, [pathname]);

  // Load admin email from storage if present
  useEffect(() => {
    const email = localStorage.getItem('sapori_admin_email');
    if (email) setAdminEmail(email);
  }, []);

  // Live orders notification polling & real-time event listener
  useEffect(() => {
    let isCancelled = false;

    const fetchLiveNotifications = async () => {
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.orders) && !isCancelled) {
          const allOrders = data.orders;
          const pending = allOrders.filter((o: any) =>
            ['PLACED', 'PENDING_PAYMENT'].includes(o.status)
          );
          setActivePendingCount(pending.length);

          const lastReadTime = Number(localStorage.getItem('sapori_admin_last_read_notif') || '0');

          const recent: AdminNotificationItem[] = allOrders.slice(0, 6).map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber || o.id.slice(-6),
            orderMode: o.orderMode || 'delivery',
            total: o.total || 0,
            customerName: o.customer?.name || 'Customer',
            status: o.status || 'PLACED',
            timestamp: new Date(o.createdAt).getTime() || Date.now(),
          }));
          setNotifications(recent);

          const unreadNew = recent.filter((n) => n.timestamp > lastReadTime);
          setUnreadCount(Math.max(pending.length, unreadNew.length));
        }
      } catch {
        // network fallback
      }
    };

    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 10000);

    const handleNewOrder = (e: any) => {
      const alert = e.detail;
      if (!alert) return;
      const newItem: AdminNotificationItem = {
        id: alert.orderId,
        orderNumber: alert.orderNumber,
        orderMode: alert.orderMode,
        total: alert.total,
        customerName: alert.customerName,
        status: alert.status || 'PLACED',
        timestamp: Date.now(),
      };
      setNotifications((prev) => [newItem, ...prev.filter((p) => p.id !== alert.orderId)].slice(0, 8));
      setUnreadCount((c) => c + 1);
      setActivePendingCount((c) => c + 1);
    };

    const handleOrderDismiss = () => {
      fetchLiveNotifications();
    };

    window.addEventListener('sapori:new_order', handleNewOrder);
    window.addEventListener('sapori:order_viewed', handleOrderDismiss);
    window.addEventListener('sapori:order_status_updated', handleOrderDismiss);

    return () => {
      isCancelled = true;
      clearInterval(interval);
      window.removeEventListener('sapori:new_order', handleNewOrder);
      window.removeEventListener('sapori:order_viewed', handleOrderDismiss);
      window.removeEventListener('sapori:order_status_updated', handleOrderDismiss);
    };
  }, []);

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadCount(0);
      localStorage.setItem('sapori_admin_last_read_notif', String(Date.now()));
    }
  };

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // If on login page, don't show admin sidebar/shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('sapori_admin_auth');
      localStorage.removeItem('sapori_admin_email');
      toast.info('You have been logged out.');
      router.push('/admin/login');
      router.refresh();
    } catch {
      toast.info('You have been logged out.');
      router.push('/admin/login');
    }
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    {
      label: 'Live Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
      badge: activePendingCount > 0 ? `${activePendingCount} New` : 'Live',
    },
    { label: 'Kitchen Display', href: '/admin/kitchen', icon: ChefHat, badge: 'KDS' },
    { label: 'Menu Catalog', href: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Tables & QR', href: '/admin/tables', icon: QrCode },
    { label: 'Reservations', href: '/admin/reservations', icon: Calendar },
    { label: 'Website CMS', href: '/admin/cms', icon: Globe, badge: 'CMS' },
    { label: 'Offers & Coupons', href: '/admin/coupons', icon: Tag },
    { label: 'Guest Reviews', href: '/admin/reviews', icon: MessageSquare },
    { label: 'Store Settings', href: '/admin/settings', icon: Sliders },
    { label: 'Audit Trail', href: '/admin/audit', icon: ShieldCheck },
  ];

  // Derive current page title for breadcrumb
  const currentNav = navItems.find((item) => item.href === pathname) || {
    label: 'Dashboard',
    href: '/admin',
  };

  return (
    <div className="min-h-screen bg-[#F5EFE1] flex flex-col md:flex-row overflow-x-hidden selection:bg-[#15370D] selection:text-[#F5EFE1]">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      {/* Mobile Topbar */}
      <header className="md:hidden bg-[#15370D] text-[#F5EFE1] px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-[#F5EFE1]/10 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:bg-[#FFFFFF]/10 rounded-xl transition-colors"
            aria-expanded={mobileSidebarOpen}
            aria-label="Open Navigation Drawer"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <Logo variant="cream" size="sm" withLink={false} />
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/admin/orders"
            className="relative w-9 h-9 flex items-center justify-center text-[#F5EFE1] hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/10 rounded-lg transition-colors"
            title="Live Orders"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-3.5 h-3.5 px-0.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-[#15370D] animate-pulse tabular-nums">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link
            href="/"
            target="_blank"
            className="px-2.5 py-1.5 rounded-lg bg-[#FFFFFF]/10 text-[#F5EFE1] text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1"
          >
            <span>Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center text-[#F5EFE1] hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/10 rounded-lg transition-colors"
            aria-label="Sign Out"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#15370D]/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Permanently Fixed Sidebar (Anchor to Viewport, Does NOT scroll with page) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 md:z-30 bg-[#15370D] text-[#F5EFE1] flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-[#F5EFE1]/10 shadow-md h-screen overflow-hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${sidebarCollapsed ? 'w-20' : 'w-72 md:w-64'}`}
      >
        {/* 1. Sidebar Top Header (Pinned at Top) */}
        <div className="flex-shrink-0 p-4 sm:p-5 border-b border-[#F5EFE1]/15 bg-[#15370D]">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed ? (
              <div className="transition-opacity duration-200">
                <Logo variant="cream" size="md" withLink={false} />
                <div className="flex items-center space-x-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFFFFF] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5EFE1]/70">
                    Operations Portal
                  </span>
                </div>
              </div>
            ) : (
              <div className="mx-auto">
                <div className="w-9 h-9 rounded-xl bg-[#FFFFFF]/10 flex items-center justify-center text-[#FFFFFF] font-black text-sm">
                  S
                </div>
              </div>
            )}

            {/* Mobile close button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-[#F5EFE1] hover:text-[#FFFFFF] p-2 hover:bg-[#FFFFFF]/10 rounded-lg"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Middle Navigation (ONLY THIS MENU SCROLLS INTERNALLY IF OVERFLOWING) */}
        <div className="flex-1 overflow-y-auto sidebar-scrollbar p-3 sm:p-4 space-y-1">
          <nav className="space-y-1" aria-label="Admin Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group relative flex items-center ${
                    sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'
                  } py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 min-h-[42px] ${
                    isActive
                      ? 'bg-[#FFFFFF] text-[#15370D] shadow-sm font-black'
                      : 'text-[#F5EFE1]/80 hover:bg-[#FFFFFF]/10 hover:text-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-transform ${
                        isActive ? 'text-[#15370D]' : 'text-[#F5EFE1]/80 group-hover:scale-110'
                      }`}
                    />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!sidebarCollapsed && item.badge && (
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-widest ${
                        isActive
                          ? 'bg-[#15370D] text-[#FFFFFF]'
                          : 'bg-[#FFFFFF]/15 text-[#F5EFE1]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Floating tooltip when collapsed */}
                  {sidebarCollapsed && (
                    <span className="hidden md:group-hover:block absolute left-full ml-3 px-2.5 py-1.5 bg-[#15370D] border border-[#F5EFE1]/20 text-[#F5EFE1] text-[11px] font-bold rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 3. Sidebar Footer (Pinned at Bottom) */}
        <div className="flex-shrink-0 p-4 sm:p-5 border-t border-[#F5EFE1]/15 space-y-3 pb-safe bg-[#15370D]">
          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex w-full items-center justify-center p-2 rounded-xl text-[#F5EFE1]/70 hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/10 transition-colors text-xs font-semibold"
            aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-[11px] uppercase tracking-wider font-bold">Collapse Rail</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            )}
          </button>

          {!sidebarCollapsed ? (
            <div className="space-y-2">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between text-xs font-bold text-[#F5EFE1]/80 hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/10 px-3 py-2 rounded-xl transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Public Café View</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#F5EFE1]/80 hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/10 px-3 py-2 rounded-xl transition-colors min-h-[38px]"
              >
                <span>Sign Out</span>
                <LogOut className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 text-[10px] text-[#F5EFE1]/60 font-mono flex items-center justify-between border-t border-[#F5EFE1]/10">
                <span>Raja Park • Pos #01</span>
                <span>v2.4 Pro</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Link
                href="/"
                target="_blank"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-[#F5EFE1]/80 hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/10"
                title="Open Public Café View"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-[#F5EFE1]/80 hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/10"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace Area with matching left margin so content is offset cleanly */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex bg-[#FFFFFF] border-b border-[#15370D]/10 px-6 lg:px-8 py-3.5 items-center justify-between sticky top-0 z-20 shadow-2xs">
          {/* Left: Breadcrumbs & Section Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-[#15370D] hover:bg-[#F5EFE1] p-2 rounded-lg transition-colors"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-[#15370D]/60">
                <Link href="/admin" className="hover:text-[#15370D]">
                  Admin Hub
                </Link>
                <span>/</span>
                <span className="text-[#15370D]">{currentNav.label}</span>
              </div>
              <h2 className="text-base font-black text-[#15370D]">{currentNav.label}</h2>
            </div>
          </div>

          {/* Middle: Global Admin Quick Search */}
          <form onSubmit={handleGlobalSearch} className="flex-1 max-w-sm mx-4 hidden xl:block">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#15370D]/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Jump to Order #, Guest or Ref (e.g. SAP-26...)"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-[#F5EFE1]/50 border border-[#15370D]/15 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#15370D] focus:outline-none focus:ring-1 focus:ring-[#15370D] font-medium"
              />
            </div>
          </form>

          {/* Right: Live Kitchen Indicator, Quick Actions, Notifications, Profile */}
          <div className="flex items-center space-x-3.5">
            {/* Live Status Pill */}
            <div className="hidden lg:flex items-center space-x-2 bg-[#F5EFE1] border border-[#15370D]/15 px-3 py-1.5 rounded-full text-xs font-bold text-[#15370D]">
              <span className="w-2 h-2 rounded-full bg-[#15370D] animate-ping" />
              <span>Live Kitchen Sync</span>
            </div>

            {/* Quick Live Site Link */}
            <Link
              href="/"
              target="_blank"
              className="bg-[#FFFFFF] border border-[#15370D]/20 hover:bg-[#F5EFE1] text-[#15370D] px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Live Café</span>
            </Link>

            {/* Realtime Live Order & Push Notification Utility */}
            <RealtimeNotificationBanner />

            {/* Notifications Menu */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleOpenNotifications}
                className="w-9 h-9 rounded-xl border border-[#15370D]/20 bg-[#FFFFFF] hover:bg-[#F5EFE1] flex items-center justify-center text-[#15370D] transition-colors relative"
                aria-label="View notifications"
                title={unreadCount > 0 ? `${unreadCount} new order alerts` : 'No new notifications'}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-600 text-[#FFFFFF] text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#FFFFFF] animate-pulse tabular-nums shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#FFFFFF] border border-[#15370D]/20 rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                        Order Notifications
                      </span>
                      {activePendingCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[9px] font-bold">
                          {activePendingCount} pending
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 ? (
                      <button
                        onClick={() => {
                          setUnreadCount(0);
                          localStorage.setItem('sapori_admin_last_read_notif', String(Date.now()));
                        }}
                        className="text-[10px] font-semibold text-[#15370D]/70 hover:text-[#15370D] cursor-pointer"
                      >
                        Mark all read
                      </button>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                        Live Sync
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs max-h-72 overflow-y-auto pr-0.5">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#15370D]/60 space-y-1">
                        <p className="font-bold">No active notifications</p>
                        <p className="text-[11px]">All orders have been viewed.</p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const isPending = ['PLACED', 'PENDING_PAYMENT'].includes(n.status);
                        return (
                          <Link
                            key={n.id}
                            href={`/admin/orders?search=${encodeURIComponent(n.orderNumber)}`}
                            onClick={() => setShowNotifications(false)}
                            className={`block p-2.5 rounded-xl border transition-colors ${
                              isPending
                                ? 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-100/60'
                                : 'bg-[#F5EFE1]/40 border-[#15370D]/10 hover:bg-[#F5EFE1]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#15370D]">
                                #{n.orderNumber}
                              </span>
                              <span className="text-[10px] text-[#15370D]/60 font-mono">
                                {formatTimeAgo(n.timestamp)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[11px] text-[#15370D]/80">
                              <span className="truncate max-w-[140px]">
                                {n.customerName} • {n.orderMode.toUpperCase()}
                              </span>
                              <span className="font-bold text-[#15370D] tabular-nums">
                                ₹{n.total}
                              </span>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>

                  <Link
                    href="/admin/orders"
                    onClick={() => setShowNotifications(false)}
                    className="block text-center text-xs font-bold uppercase tracking-wider text-[#15370D] hover:underline pt-1 border-t border-[#15370D]/10"
                  >
                    View All Orders in Manager →
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl border border-[#15370D]/20 bg-[#FFFFFF] hover:bg-[#F5EFE1] transition-colors"
                aria-label="User profile menu"
              >
                <div className="w-7 h-7 rounded-lg bg-[#15370D] text-[#FFFFFF] font-black text-xs flex items-center justify-center">
                  S
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-[#15370D] leading-tight">Admin Staff</div>
                  <div className="text-[10px] text-[#15370D]/60 truncate max-w-[120px]">
                    {adminEmail}
                  </div>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] border border-[#15370D]/20 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-[#15370D]/10 text-xs">
                    <p className="font-bold text-[#15370D]">Manager Access</p>
                    <p className="text-[10px] text-[#15370D]/60 truncate font-mono">{adminEmail}</p>
                  </div>
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#15370D] hover:bg-[#F5EFE1]"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Store Settings</span>
                  </Link>
                  <Link
                    href="/admin/audit"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#15370D] hover:bg-[#F5EFE1]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Audit Logs</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowCredentialsModal(true);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#15370D] hover:bg-[#F5EFE1] text-left cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#DEB853]" />
                    <span>Change ID &amp; Password</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold text-[#15370D] hover:bg-[#F5EFE1] text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* Security Credentials Modal */}
      <ChangeCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        onSuccess={(user) => setAdminEmail(user.email)}
      />
    </div>
  );
}
