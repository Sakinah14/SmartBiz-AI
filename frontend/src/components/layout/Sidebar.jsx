import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Wallet,
  BarChart3,
  Bot,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Products", path: "/products", icon: Package },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Orders", path: "/orders", icon: ShoppingCart },
  { name: "Expenses", path: "/expenses", icon: Wallet },
  { name: "Reports", path: "/reports", icon: BarChart3 },
  { name: "AI Assistant", path: "/ai-assistant", icon: Bot },
];

function Sidebar() {
  const { logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      style={{
        width: "288px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: isDark
          ? "linear-gradient(180deg, #060912 0%, #0c101d 100%)"
          : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        borderRight: isDark ? "1px solid rgba(30, 41, 59, 0.8)" : "1px solid rgba(203, 213, 225, 0.7)",
        flexShrink: 0,
        userSelect: "none",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "28px 28px 24px",
          borderBottom: isDark ? "1px solid rgba(30, 41, 59, 0.8)" : "1px solid rgba(203, 213, 225, 0.7)",
        }}
      >
        <div style={{ display: "flex", items: "center", gap: "16px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px -4px rgba(99,102,241,0.4)",
              flexShrink: 0,
            }}
          >
            <Zap size={22} color="white" />
          </div>
          <div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 800,
                background: "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              SmartBiz AI
            </h1>
            <p
              style={{
                fontSize: "10px",
                color: isDark ? "#64748b" : "#94a3b8",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginTop: "3px",
              }}
            >
              Enterprise Suite
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: "24px 16px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {/* Section label */}
        <p
          style={{
            fontSize: "10px",
            color: isDark ? "#475569" : "#94a3b8",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "0 12px",
            marginBottom: "12px",
          }}
        >
          Main Workspace
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isAI = item.name === "AI Assistant";
          return (
            <NavLink
              key={item.name}
              to={item.path}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 16px",
                borderRadius: "16px",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                border: isActive
                  ? isAI
                    ? "1px solid rgba(6,182,212,0.4)"
                    : "1px solid rgba(99,102,241,0.4)"
                  : "1px solid transparent",
                background: isActive
                  ? isAI
                    ? isDark
                      ? "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(6,182,212,0.2))"
                      : "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.1))"
                    : isDark
                      ? "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))"
                      : "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))"
                  : "transparent",
                color: isActive
                  ? isAI
                    ? isDark ? "#67e8f9" : "#0891b2"
                    : isDark ? "#a5b4fc" : "#4f46e5"
                  : isDark ? "#94a3b8" : "#475569",
                boxShadow: isActive
                  ? isAI
                    ? "0 4px 20px -4px rgba(6,182,212,0.15)"
                    : "0 4px 20px -4px rgba(99,102,241,0.15)"
                  : "none",
                transition: "all 0.2s ease",
              })}
            >
              {({ isActive }) => (
                <>
                  <div
                    style={{
                      padding: "8px",
                      borderRadius: "10px",
                      background: isActive
                        ? isAI
                          ? "rgba(6,182,212,0.15)"
                          : "rgba(99,102,241,0.15)"
                        : "transparent",
                      color: isActive
                        ? isAI
                          ? isDark ? "#67e8f9" : "#0891b2"
                          : isDark ? "#a5b4fc" : "#4f46e5"
                        : isDark ? "#64748b" : "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <span style={{ flex: 1 }}>{item.name}</span>
                  {isAI && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        backgroundColor: "rgba(99,102,241,0.15)",
                        border: "1px solid rgba(139,92,246,0.3)",
                        padding: "2px 8px",
                        borderRadius: "99px",
                      }}
                    >
                      PRO
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer — Sign Out */}
      <div
        style={{
          padding: "16px",
          borderTop: isDark ? "1px solid rgba(30, 41, 59, 0.8)" : "1px solid rgba(203, 213, 225, 0.7)",
          background: isDark ? "rgba(15, 23, 42, 0.4)" : "rgba(241, 245, 249, 0.6)",
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "14px 16px",
            borderRadius: "16px",
            fontSize: "14px",
            fontWeight: 600,
            color: isDark ? "#64748b" : "#475569",
            background: "transparent",
            border: "1px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fb7185";
            e.currentTarget.style.background = "rgba(244,63,94,0.08)";
            e.currentTarget.style.borderColor = "rgba(244,63,94,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isDark ? "#64748b" : "#475569";
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          <div
            style={{
              padding: "8px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LogOut size={18} />
          </div>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;