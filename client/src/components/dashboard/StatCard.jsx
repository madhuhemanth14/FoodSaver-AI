function StatCard({ title, value, icon }) {
  return (
    <div className="card stat-card">
      <div className="stat-icon">{icon}</div>

      <h3>{value}</h3>

      <p>{title}</p>
    </div>
  );
}

export default StatCard;