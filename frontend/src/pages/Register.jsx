import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Zap, ArrowRight, ShieldCheck, Package, Users, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import Input from "../components/ui/Input";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await api.post("/auth/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Make sure backend server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: isDark ? "#070a13" : "#f1f5f9",
        color: isDark ? "#f8fafc" : "#0f172a",
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Left Hero Panel */}
      <div
        className="dark-panel hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden"
        style={{
          padding: "56px",
          background: "linear-gradient(135deg, #060913 0%, #0a1628 50%, #060913 100%)",
          borderRight: isDark ? "1px solid rgba(30,41,59,0.8)" : "1px solid rgba(203,213,225,0.7)",
        }}
      >
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/15 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-600/15 rounded-full filter blur-3xl pointer-events-none" />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", position: "relative", zIndex: 10 }}>
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
            <span
              style={{
                fontSize: "22px",
                fontWeight: 800,
                background: "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.02em",
                display: "block",
              }}
            >
              SmartBiz AI
            </span>
            <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", display: "block" }}>
              Enterprise Suite
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ position: "relative", zIndex: 10, marginTop: "auto", marginBottom: "auto", paddingTop: "32px", paddingBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "99px",
              background: "rgba(6,182,212,0.1)",
              border: "1px solid rgba(6,182,212,0.25)",
              color: "#67e8f9",
              fontSize: "12px",
              fontWeight: 700,
              marginBottom: "24px",
            }}
          >
            <ShieldCheck size={14} />
            Quick Setup · Secure · Free
          </div>

          <h1
            style={{
              color: "#ffffff",
              fontSize: "44px",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            Start growing{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "block",
                marginTop: "4px",
              }}
            >
              your business today
            </span>
          </h1>

          <p style={{ color: "#94a3b8", fontSize: "15px", lineHeight: 1.6, marginBottom: "36px", fontWeight: 500, maxWidth: "460px" }}>
            Get started with SmartBiz AI to streamline products, customers, transactions, and real-time business insights.
          </p>

          {/* Feature List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { icon: Package, title: "Smart Inventory", desc: "Real-time stock tracking & low-inventory alerts" },
              { icon: Users, title: "Customer Management", desc: "Detailed customer histories & order analytics" },
              { icon: Sparkles, title: "Gemini AI Advisor", desc: "Financial summaries & strategic recommendations" },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "14px 18px",
                    borderRadius: "16px",
                    background: "rgba(15, 23, 42, 0.5)",
                    border: "1px solid rgba(30, 41, 59, 0.8)",
                  }}
                >
                  <div
                    style={{
                      padding: "10px",
                      borderRadius: "12px",
                      background: "rgba(6,182,212,0.15)",
                      border: "1px solid rgba(6,182,212,0.25)",
                      color: "#67e8f9",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 style={{ color: "#f1f5f9", fontSize: "14px", fontWeight: 700 }}>{f.title}</h4>
                    <p style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 10, paddingTop: "20px", borderTop: "1px solid rgba(30,41,59,0.6)" }}>
          <p style={{ color: "#64748b", fontSize: "12px", fontWeight: 500 }}>
            © 2026 SmartBiz AI Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            padding: "44px 38px",
            borderRadius: "24px",
            background: isDark ? "#0f172a" : "#ffffff",
            border: isDark ? "1px solid rgba(51, 65, 85, 0.8)" : "1px solid #e2e8f0",
            boxShadow: isDark
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.6)"
              : "0 20px 40px -12px rgba(0, 0, 0, 0.06)",
            transition: "all 0.3s ease",
          }}
        >
          {/* Form Header Title */}
          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "26px",
                fontWeight: 800,
                color: isDark ? "#f8fafc" : "#0f172a",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Create Your Account
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister}>
            {error && (
              <div
                style={{
                  padding: "14px 16px",
                  marginBottom: "24px",
                  borderRadius: "14px",
                  background: "rgba(244, 63, 94, 0.1)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  color: "#f43f5e",
                  fontSize: "13px",
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <Input
                id="name"
                label="Full Name / Business Name"
                type="text"
                placeholder="John Business Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="name@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />
            </div>

            <div style={{ marginBottom: "32px" }}>
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 24px -4px rgba(99,102,241,0.4)",
                transition: "all 0.2s ease",
                marginBottom: "24px",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span style={{ color: "#ffffff" }}>Creating account...</span>
                </>
              ) : (
                <>
                  <span style={{ color: "#ffffff" }}>Create Account</span>
                  <ArrowRight size={18} color="white" />
                </>
              )}
            </button>

            <p
              style={{
                textAlign: "center",
                fontSize: "13px",
                fontWeight: 600,
                color: isDark ? "#64748b" : "#94a3b8",
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#6366f1",
                  fontWeight: 700,
                  textDecoration: "none",
                  marginLeft: "4px",
                }}
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;