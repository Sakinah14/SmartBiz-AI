import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import Input from "../components/ui/Input";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password", { token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please request a new reset link."
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
        alignItems: "center",
        justifyContent: "center",
        background: isDark ? "#070a13" : "#f1f5f9",
        color: isDark ? "#f8fafc" : "#0f172a",
        padding: "32px 24px",
        transition: "background 0.3s ease, color 0.3s ease",
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
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px -4px rgba(99,102,241,0.4)",
              flexShrink: 0,
            }}
          >
            <Zap size={20} color="white" />
          </div>
          <span
            style={{
              fontSize: "18px",
              fontWeight: 800,
              background: "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
            }}
          >
            SmartBiz AI
          </span>
        </div>

        {success ? (
          <div>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <ShieldCheck size={26} color="#10b981" />
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "10px", color: isDark ? "#f8fafc" : "#0f172a" }}>
              Password reset successful
            </h2>
            <p style={{ fontSize: "14px", color: isDark ? "#94a3b8" : "#475569", lineHeight: 1.6, marginBottom: "28px" }}>
              Your password has been updated. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
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
              }}
            >
              <span style={{ color: "#ffffff" }}>Go to Sign In</span>
              <ArrowRight size={18} color="white" />
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "8px", color: isDark ? "#f8fafc" : "#0f172a" }}>
              Set a new password
            </h2>
            <p style={{ fontSize: "13px", color: isDark ? "#94a3b8" : "#64748b", marginBottom: "28px", lineHeight: 1.6 }}>
              Choose a new password for your account. This link can only be used once.
            </p>

            <form onSubmit={handleSubmit}>
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

              <div style={{ marginBottom: "20px" }}>
                <Input
                  id="newPassword"
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  icon={Lock}
                  required
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <Input
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={Lock}
                  required
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
                    <span style={{ color: "#ffffff" }}>Resetting...</span>
                  </>
                ) : (
                  <>
                    <span style={{ color: "#ffffff" }}>Reset Password</span>
                    <ArrowRight size={18} color="white" />
                  </>
                )}
              </button>

              <p style={{ textAlign: "center", fontSize: "13px", fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8" }}>
                <Link to="/login" style={{ color: "#6366f1", fontWeight: 700, textDecoration: "none" }}>
                  Back to Sign In
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
