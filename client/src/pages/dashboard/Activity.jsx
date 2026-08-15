import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function Activity() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f9f7",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
        color: "#263238",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "9px 13px",
            border: "1px solid #dfe7df",
            background: "white",
            color: "#2e7d32",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1 style={{ margin: 0, color: "#2e7d32" }}>
          Recent Activity
        </h1>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "12px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        }}
      >
        <h3>📦 Listed a new donation</h3>
        <p>Vegetable Biryani Trays</p>
        <small>Today, 10:30 AM</small>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "12px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        }}
      >
        <h3>🚚 Pickup scheduled</h3>
        <p>Sunrise Bakery</p>
        <small>Today, 5:30 PM</small>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        }}
      >
        <h3>✅ Donation completed</h3>
        <p>Food successfully delivered</p>
        <small>Yesterday</small>
      </div>
    </div>
  );
}

export default Activity;