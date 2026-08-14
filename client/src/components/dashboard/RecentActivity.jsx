function RecentActivity() {
  return (
    <div className="activity">

      <div className="activity-item">
        <span className="activity-icon">🍱</span>

        <div>
          <strong>Veg Pulao donated</strong>
          <p>5 kg • Today, 10:30 AM</p>
        </div>
      </div>

      <div className="activity-item">
        <span className="activity-icon">🚚</span>

        <div>
          <strong>Pickup scheduled</strong>
          <p>Today, 12:00 PM</p>
        </div>
      </div>

      <div className="activity-item">
        <span className="activity-icon">✅</span>

        <div>
          <strong>Donation completed</strong>
          <p>Yesterday, 4:20 PM</p>
        </div>
      </div>

    </div>
  );
}

export default RecentActivity;