import { Bell, Moon, Sun, Search, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const routeTitles = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/customers": "Customers",
  "/orders": "Orders",
  "/expenses": "Expenses",
  "/reports": "Reports",
  "/ai-assistant": "AI Assistant",
};

function Navbar({ onMenuToggle }) {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const pageTitle = routeTitles[location.pathname] || "SmartBiz AI";

  return (
    <header
      className="px-4 sm:px-6 lg:px-10 gap-3"
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
      <div className="flex-shrink-0 min-w-0" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
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
        <div>
          <h2 style={{
            fontSize: "20px",
            fontWeight: 800,
            color: isDark ? "#f8fafc" : "#0f172a",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}>
            {pageTitle}
          </h2>
          <p style={{ fontSize: "11px", color: isDark ? "#64748b" : "#94a3b8", fontWeight: 500, marginTop: "2px" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Center — Search */}
      <div
        className="hidden lg:flex flex-1 min-w-0 max-w-[300px] xl:max-w-[360px] mx-4"
        style={{
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
        <kbd style={{
          fontSize: "10px",
          color: isDark ? "#64748b" : "#94a3b8",
          background: isDark ? "rgba(30,41,59,0.8)" : "rgba(226,232,240,0.8)",
          padding: "2px 6px",
          borderRadius: "6px",
          fontFamily: "monospace",
          border: isDark ? "1px solid rgba(51,65,85,0.6)" : "1px solid rgba(203,213,225,0.6)",
        }}>⌘K</kbd>
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
        <button style={{
          position: "relative",
          padding: "9px",
          borderRadius: "12px",
          background: "transparent",
          border: isDark ? "1px solid rgba(51,65,85,0.6)" : "1px solid rgba(203,213,225,0.6)",
          color: isDark ? "#94a3b8" : "#475569",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Bell size={18} />
          <span style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "7px",
            height: "7px",
            background: "#6366f1",
            borderRadius: "50%",
          }} />
        </button>

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
            <span style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              width: "10px",
              height: "10px",
              background: "#10b981",
              borderRadius: "50%",
              border: isDark ? "2px solid #070a13" : "2px solid #ffffff",
            }} />
          </div>
          <div className="hidden lg:block">
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