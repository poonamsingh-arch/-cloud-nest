import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (isRegister) {
        await axios.post("http://localhost:3000/register", form);
        setIsRegister(false);
        setError("Registered successfully! Please login.");
      } else {
        const res = await axios.post("http://localhost:3000/login", form);
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a0f1e 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      padding: "20px"
    }}>
      {/* Animated background dots */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0 }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: Math.random() * 4 + 1 + "px",
            height: Math.random() * 4 + 1 + "px",
            background: "#3b82f6",
            borderRadius: "50%",
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5 + 0.1,
          }} />
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            borderRadius: "16px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
            boxShadow: "0 0 30px rgba(59,130,246,0.5)"
          }}>
            <span style={{ fontSize: "24px" }}>☁️</span>
          </div>
          <h1 style={{ color: "white", fontSize: "28px", fontWeight: "700", margin: "0 0 4px" }}>CloudNest</h1>
          <p style={{ color: "#60a5fa", fontSize: "14px", margin: 0 }}>AI-Powered Document Intelligence</p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
        }}>
          <h2 style={{ color: "white", fontSize: "20px", fontWeight: "600", margin: "0 0 24px" }}>
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5",
              padding: "12px 16px",
              borderRadius: "12px",
              marginBottom: "16px",
              fontSize: "14px"
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {isRegister && (
              <input
                type="text"
                placeholder="Full Name"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box"
                }}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "14px 16px",
                color: "white",
                fontSize: "14px",
                outline: "none",
                width: "100%",
                boxSizing: "border-box"
              }}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "14px 16px",
                color: "white",
                fontSize: "14px",
                outline: "none",
                width: "100%",
                boxSizing: "border-box"
              }}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "20px",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              border: "none",
              borderRadius: "12px",
              padding: "14px",
              color: "white",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(59,130,246,0.4)"
            }}
          >
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
          </button>

          <p style={{ textAlign: "center", color: "#60a5fa", marginTop: "16px", fontSize: "14px" }}>
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <span
              onClick={() => setIsRegister(!isRegister)}
              style={{ color: "white", fontWeight: "600", cursor: "pointer" }}
            >
              {isRegister ? "Sign In" : "Sign Up"}
            </span>
          </p>
        </div>

        {/* Features */}
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "24px" }}>
          {["🤖 AI Chat", "📄 PDF Upload", "🔒 Secure"].map((f) => (
            <span key={f} style={{ color: "#64748b", fontSize: "12px" }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}