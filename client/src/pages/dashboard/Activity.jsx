function Activity() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8faf8",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#2e7d32" }}>
        Activity
      </h1>

      <p>Recent donation and pickup activity</p>

      <div
        style={{
          background: "white",
          padding: "20px",
          marginTop: "20px",
          borderRadius: "16px",
        }}
      >
        <h3>🍱 Food Donation Created</h3>
        <p>Your food donation was submitted successfully.</p>
        <small>Today, 10:30 AM</small>
      </div>

      <div
        style={{
          background: "white",
          padding: "20px",
          marginTop: "12px",
          borderRadius: "16px",
        }}
      >
        <h3>🚚 Pickup Scheduled</h3>
        <p>Your pickup is scheduled for 4:30 PM.</p>
        <small>Today, 12:00 PM</small>
      </div>

      <div
        style={{
          background: "white",
          padding: "20px",
          marginTop: "12px",
          borderRadius: "16px",
        }}
      >
        <h3>✅ Pickup Completed</h3>
        <p>Your donation was successfully picked up.</p>
        <small>Yesterday, 4:20 PM</small>
      </div>
    </div>
  );
}

export default Activity;