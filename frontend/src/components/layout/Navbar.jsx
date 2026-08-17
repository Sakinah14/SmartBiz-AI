import { useState, useEffect, useRef } from "react";
import { Bell, Moon, Sun, Search, Menu, PackageX, AlertTriangle, ShoppingCart, CheckCircle2, Package, Users, SearchX } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";

const routeTitles = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/customers": "Customers",
  "/orders": "Orders",
  "/expenses": "Expenses",
  "/reports": "Reports",
  "/decision-timeline": "Decision Timeline",
  "/ai-assistant": "AI Assistant",
};

const LOW_STOCK_THRESHOLD = 5;
const RECENT_ORDER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const NEEDS_ATTENTION_STATUSES = ["pending", "processing"];

function Navbar({ onMenuToggle }) {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = routeTitles[location.pathname] || "SmartBiz AI";

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const bellRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchWrapRef = useRef(null);

  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        const [productsRes, ordersRes, customersRes] = await Promise.all([
          api.get("/products"),
          api.get("/orders"),
          api.get("/customers"),
        ]);
        setProducts(productsRes.data || []);
        setOrders(ordersRes.data || []);
        setCustomers(customersRes.data || []);
      } catch (err) {
        console.error("Notification data fetch error:", err);
      }
    };
    fetchNotificationData();
  }, []);

  useEffect(() => {
    if (!notifOpen) return;
    const handleOutsideClick = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setNotifOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notifOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handleOutsideClick = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [searchOpen]);

  const outOfStock = products.filter((p) => p.quantity === 0);
  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= LOW_STOCK_THRESHOLD);
  const recentOrders = [...orders]
    .filter((o) => o.createdAt && Date.now() - new Date(o.createdAt).getTime() <= RECENT_ORDER_WINDOW_MS)
    .filter((o) => NEEDS_ATTENTION_STATUSES.includes((o.status || o.orderStatus || "Pending").toLowerCase()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const notifications = [
    ...outOfStock.map((p) => ({
      id: `out-${p._id}`,
      type: "danger",
      icon: PackageX,
      title: `${p.name} is out of stock`,
      subtitle: "Restock needed",
      path: "/products",
    })),
    ...lowStock.map((p) => ({
      id: `low-${p._id}`,
      type: "warning",
      icon: AlertTriangle,
      title: `${p.name} is running low`,
      subtitle: `${p.quantity} unit${p.quantity !== 1 ? "s" : ""} left`,
      path: "/products",
    })),
    ...recentOrders.map((o) => ({
      id: `order-${o._id}`,
      type: "info",
      icon: ShoppingCart,
      title: `New order from ${o.customer?.name || "a customer"}`,
      subtitle: `₹${o.totalAmount?.toLocaleString() || 0}`,
      path: "/orders",
    })),
  ];

  const unreadCount = seen ? 0 : notifications.length;

  const toggleNotifications = () => {
    setNotifOpen((open) => !open);
    setSeen(true);
  };

  const goToNotification = (path) => {
    setNotifOpen(false);
    navigate(path);
  };

  const typeStyles = {
    danger: "bg-rose-500/15 text-rose-400",
    warning: "bg-amber-500/15 text-amber-400",
    info: "bg-indigo-500/15 text-indigo-400",
  };

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchActive = trimmedQuery.length >= 2;

  const matchedProducts = searchActive
    ? products
        .filter(
          (p) =>
            (p.name || "").toLowerCase().includes(trimmedQuery) ||
            (p.category || "").toLowerCase().includes(trimmedQuery)
        )
        .slice(0, 5)
    : [];

  const matchedCustomers = searchActive
    ? customers
        .filter(
          (c) =>
            (c.name || "").toLowerCase().includes(trimmedQuery) ||
            (c.email || "").toLowerCase().includes(trimmedQuery) ||
            (c.phone || "").toLowerCase().includes(trimmedQuery)
        )
        .slice(0, 5)
    : [];

  const matchedOrders = searchActive
    ? orders
        .filter(
          (o) =>
            (o.customer?.name || "").toLowerCase().includes(trimmedQuery) ||
            (o._id || "").toLowerCase().includes(trimmedQuery) ||
            (o.status || o.orderStatus || "").toLowerCase().includes(trimmedQuery)
        )
        .slice(0, 5)
    : [];

  const hasSearchResults = matchedProducts.length + matchedCustomers.length + matchedOrders.length > 0;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchOpen(value.trim().length >= 2);
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim().length >= 2) setSearchOpen(true);
  };

  const goToSearchResult = (path) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(path);
  };

  return (
    <header
      className="px-4 sm:px-6 lg:px-10 gap-3 min-w-0"
      style={{
        height: "72px",
        borderBottom: isDark ? "1px solid rgba(30,41,59,0.8)" : "1px solid rgba(203,213,225,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        zIndex: 30,
        background: isDark ? "rgba(7, 10, 19, 0.9)" : "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Left — Page title */}
      <div className="flex-1 min-w-0" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            aria-label="Toggle sidebar"
            className="flex-shrink-0"
            style={{
              padding: "8px",
              borderRadius: "10px",
              background: "transparent",
              border: isDark ? "1px solid rgba(51,65,85,0.4)" : "1px solid rgba(203,213,225,0.6)",
              color: isDark ? "#94a3b8" : "#475569",
              cursor: "pointer",
            }}
          >
            <Menu size={20} />
          </button>
        )}
        <div className="min-w-0">
          <h2 className="truncate" style={{
            fontSize: "20px",
            fontWeight: 800,
            color: isDark ? "#f8fafc" : "#0f172a",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}>
            {pageTitle}
          </h2>
          <p className="truncate hidden sm:block" style={{ fontSize: "11px", color: isDark ? "#64748b" : "#94a3b8", fontWeight: 500, marginTop: "2px" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Center — Search */}
      <div
        ref={searchWrapRef}
        className="hidden lg:flex flex-1 min-w-0 max-w-[300px] xl:max-w-[360px] mx-4"
        style={{
          position: "relative",
          alignItems: "center",
          gap: "10px",
          background: isDark ? "rgba(15,23,42,0.6)" : "rgba(241,245,249,0.8)",
          border: isDark ? "1px solid rgba(51,65,85,0.6)" : "1px solid rgba(203,213,225,0.7)",
          borderRadius: "16px",
          padding: "8px 16px",
          transition: "all 0.2s ease",
        }}
      >
        <Search size={15} color={isDark ? "#64748b" : "#94a3b8"} />
        <input
          type="text"
          placeholder="Search products, orders, customers..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          role="combobox"
          aria-label="Search products, orders, customers"
          aria-haspopup="listbox"
          aria-expanded={searchOpen}
          aria-controls="navbar-search-results"
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "13px",
            color: isDark ? "#e2e8f0" : "#334155",
            flex: 1,
            fontFamily: "inherit",
          }}
        />

        {searchOpen && (
          <div
            id="navbar-search-results"
            role="menu"
            className="absolute left-0 right-0 top-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in"
          >
            <div className="max-h-[360px] overflow-y-auto">
              {!hasSearchResults ? (
                <div className="flex flex-col items-center justify-center gap-2.5 py-10 px-4 text-center">
                  <SearchX size={26} className="text-slate-600" />
                  <p className="text-sm font-semibold text-slate-300">No results found</p>
                </div>
              ) : (
                <>
                  {matchedProducts.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Products
                      </p>
                      {matchedProducts.map((p) => (
                        <button
                          key={p._id}
                          role="menuitem"
                          onClick={() => goToSearchResult("/products")}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 flex-shrink-0">
                            <Package size={13} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-200 truncate">{p.name}</p>
                            <p className="text-[11px] text-slate-500">
                              ₹{Number(p.price || 0).toLocaleString()} · {p.quantity ?? 0} in stock
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchedCustomers.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Customers
                      </p>
                      {matchedCustomers.map((c) => (
                        <button
                          key={c._id}
                          role="menuitem"
                          onClick={() => goToSearchResult("/customers")}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 flex-shrink-0">
                            <Users size={13} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-200 truncate">{c.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{c.email || c.phone || "—"}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchedOrders.length > 0 && (
                    <div>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Orders
                      </p>
                      {matchedOrders.map((o) => (
                        <button
                          key={o._id}
                          role="menuitem"
                          onClick={() => goToSearchResult("/orders")}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 flex-shrink-0">
                            <ShoppingCart size={13} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-200 truncate">
                              {o.customer?.name || "Unknown customer"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              ₹{Number(o.totalAmount || 0).toLocaleString()} · {o.status || o.orderStatus || "Pending"}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right — Actions */}
      <div className="flex-shrink-0" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            padding: "9px",
            borderRadius: "12px",
            background: "transparent",
            border: isDark ? "1px solid rgba(51,65,85,0.6)" : "1px solid rgba(203,213,225,0.6)",
            color: isDark ? "#94a3b8" : "#475569",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = isDark ? "#f8fafc" : "#0f172a";
            e.currentTarget.style.background = isDark ? "rgba(30,41,59,0.6)" : "rgba(241,245,249,0.9)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isDark ? "#94a3b8" : "#475569";
            e.currentTarget.style.background = "transparent";
          }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={toggleNotifications}
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={notifOpen}
            style={{
              position: "relative",
              padding: "9px",
              borderRadius: "12px",
              background: notifOpen ? (isDark ? "rgba(30,41,59,0.6)" : "rgba(241,245,249,0.9)") : "transparent",
              border: isDark ? "1px solid rgba(51,65,85,0.6)" : "1px solid rgba(203,213,225,0.6)",
              color: isDark ? "#94a3b8" : "#475569",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="absolute flex items-center justify-center rounded-full font-bold text-white"
                style={{
                  top: "4px",
                  right: "4px",
                  minWidth: "16px",
                  height: "16px",
                  padding: "0 3px",
                  fontSize: "10px",
                  lineHeight: 1,
                  background: "#f43f5e",
                  border: isDark ? "2px solid #070a13" : "2px solid #ffffff",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              ref={dropdownRef}
              role="menu"
              className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in"
            >
              <div className="px-4 py-3.5 border-b border-slate-800/80">
                <p className="text-sm font-bold text-white">Notifications</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {notifications.length > 0
                    ? `${notifications.length} alert${notifications.length !== 1 ? "s" : ""}`
                    : "No new alerts"}
                </p>
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2.5 py-10 px-4 text-center">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                    <p className="text-sm font-semibold text-slate-300">You&rsquo;re all caught up.</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <button
                        key={n.id}
                        role="menuitem"
                        onClick={() => goToNotification(n.path)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-800/50 transition-colors border-b border-slate-800/60 last:border-b-0"
                      >
                        <div className={`p-2 rounded-xl flex-shrink-0 ${typeStyles[n.type]}`}>
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-200 truncate">{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{n.subtitle}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginLeft: "6px",
          paddingLeft: "14px",
          borderLeft: isDark ? "1px solid rgba(30,41,59,0.8)" : "1px solid rgba(203,213,225,0.6)",
        }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
            }}>
              B
            </div>
            <span
              role="status"
              aria-label="Online"
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                width: "10px",
                height: "10px",
                background: "#10b981",
                borderRadius: "50%",
                border: isDark ? "2px solid #070a13" : "2px solid #ffffff",
              }}
            />
          </div>
          <div className="hidden xl:block">
            <p style={{ fontSize: "13px", fontWeight: 700, color: isDark ? "#f8fafc" : "#0f172a", lineHeight: 1.2 }}>
              Business Owner
            </p>
            <p style={{ fontSize: "10px", color: isDark ? "#64748b" : "#94a3b8", fontWeight: 500, marginTop: "1px" }}>
              SmartBiz Admin
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
