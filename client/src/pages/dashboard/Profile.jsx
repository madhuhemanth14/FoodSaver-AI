function Profile() {
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
        My Profile
      </h1>

      <div
        style={{
          marginTop: "20px",
          background: "white",
          padding: "25px",
          borderRadius: "18px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
          maxWidth: "500px",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "#d9efd9",
            color: "#2e7d32",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          S
        </div>

        <h2>Sowmya Dasari</h2>

        <p>
          <strong>Email:</strong> dasarisowmya15@gmail.com
        </p>

        <p>
          <strong>Role:</strong> Donor
        </p>

        <p>
          <strong>Location:</strong> Ongole
        </p>
      </div>
    </div>
  );
}

export default Profile;