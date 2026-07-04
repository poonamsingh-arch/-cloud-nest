import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    const res = await axios.get("http://localhost:3000/documents");
    setDocuments(res.data);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    await axios.post("http://localhost:3000/upload", formData);
    setFile(null);
    fetchDocuments();
    setUploading(false);
  };

  const handleAsk = async () => {
    if (!question) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await axios.post("http://localhost:3000/ask-ai", { question });
      setAnswer(res.data.answer);
    } catch (err) {
      setAnswer("Error: " + err.response?.data?.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/documents/${id}`);
    fetchDocuments();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a0f1e 100%)",
      fontFamily: "system-ui, sans-serif",
      color: "white"
    }}>
      {/* Navbar */}
      <nav style={{
        background: "rgba(255,255,255,0.03)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px",
            boxShadow: "0 0 20px rgba(59,130,246,0.4)"
          }}>☁️</div>
          <span style={{ fontWeight: "700", fontSize: "18px" }}>CloudNest</span>
          <span style={{
            background: "rgba(59,130,246,0.2)",
            color: "#60a5fa",
            fontSize: "11px",
            padding: "3px 10px",
            borderRadius: "20px",
            border: "1px solid rgba(59,130,246,0.3)"
          }}>AI Platform</span>
        </div>
        <button onClick={handleLogout} style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#94a3b8",
          padding: "8px 16px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "13px"
        }}>Sign Out</button>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 8px" }}>
            Welcome to CloudNest 👋
          </h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Upload documents and chat with AI instantly
          </p>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Documents", value: documents.length, icon: "📄", color: "#3b82f6" },
            { label: "AI Ready", value: "Active", icon: "🤖", color: "#10b981" },
            { label: "Storage", value: "Cloud", icon: "☁️", color: "#8b5cf6" }
          ].map((stat) => (
            <div key={stat.label} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "48px", height: "48px",
                background: stat.color + "20",
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px"
              }}>{stat.icon}</div>
              <div>
                <p style={{ color: "#64748b", fontSize: "12px", margin: "0 0 4px" }}>{stat.label}</p>
                <p style={{ fontWeight: "700", fontSize: "20px", margin: 0 }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Upload Card */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                📤 Upload Document
              </h2>
              <div
                onClick={() => document.getElementById("fileInput").click()}
                style={{
                  border: "2px dashed rgba(59,130,246,0.3)",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                  cursor: "pointer",
                  marginBottom: "12px",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📁</div>
                <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                  {file ? file.name : "Click to select PDF"}
                </p>
                <input id="fileInput" type="file" accept=".pdf" style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files[0])} />
              </div>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                style={{
                  width: "100%",
                  background: file ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "rgba(255,255,255,0.05)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px",
                  color: file ? "white" : "#64748b",
                  fontWeight: "600",
                  cursor: file ? "pointer" : "not-allowed",
                  fontSize: "14px"
                }}
              >
                {uploading ? "Uploading..." : "Upload File"}
              </button>
            </div>

            {/* Documents List */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                📄 Documents ({documents.length})
              </h2>
              {documents.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
                  No documents yet
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {documents.map((doc) => (
                    <div key={doc._id} style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          background: "rgba(239,68,68,0.15)",
                          borderRadius: "6px",
                          padding: "4px 6px",
                          fontSize: "10px",
                          color: "#f87171",
                          fontWeight: "700"
                        }}>PDF</div>
                        <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{doc.filename}</span>
                      </div>
                      <button onClick={() => handleDelete(doc._id)} style={{
                        background: "none", border: "none",
                        color: "#64748b", cursor: "pointer", fontSize: "16px"
                      }}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - AI Chat */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
              🤖 Ask AI About Your Documents
            </h2>

            {/* Answer Area */}
            <div style={{
              background: "rgba(0,0,0,0.2)",
              borderRadius: "12px",
              padding: "20px",
              minHeight: "300px",
              marginBottom: "16px",
              border: "1px solid rgba(255,255,255,0.05)"
            }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#64748b" }}>
                  <div style={{ fontSize: "24px" }}>🤔</div>
                  <div>
                    <p style={{ margin: "0 0 4px", color: "#60a5fa" }}>AI is thinking...</p>
                    <p style={{ margin: 0, fontSize: "13px" }}>Analyzing your documents</p>
                  </div>
                </div>
              ) : answer ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <div style={{
                      width: "28px", height: "28px",
                      background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                      borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "14px"
                    }}>🤖</div>
                    <span style={{ color: "#a78bfa", fontWeight: "600", fontSize: "14px" }}>AI Answer</span>
                  </div>
                  <p style={{ color: "#e2e8f0", lineHeight: "1.7", fontSize: "14px", margin: 0 }}>{answer}</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "260px", textAlign: "center" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
                  <p style={{ color: "#475569", fontSize: "14px", margin: 0 }}>
                    Upload a PDF and ask any question about it
                  </p>
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ display: "flex", gap: "12px" }}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                placeholder="Ask anything about your documents..."
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
              <button
                onClick={handleAsk}
                disabled={loading || !question}
                style={{
                  background: question ? "linear-gradient(135deg, #3b82f6, #1d4ed8)" : "rgba(255,255,255,0.05)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px 20px",
                  color: "white",
                  fontWeight: "600",
                  cursor: question ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  boxShadow: question ? "0 0 20px rgba(59,130,246,0.4)" : "none"
                }}
              >
                Ask AI 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}