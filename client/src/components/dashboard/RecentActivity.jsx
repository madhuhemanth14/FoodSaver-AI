const activities = [
  {
    id: 1,
    icon: "🍱",
    title: "Food Donation Created",
    description: "Your Veg Pulao donation was submitted successfully.",
    time: "Today, 10:30 AM",
    status: "Completed",
    statusType: "success",
  },
  {
    id: 2,
    icon: "🤖",
    title: "Food Analysis Completed",
    description: "AI analysis identified your food as fresh.",
    time: "Today, 10:45 AM",
    status: "Completed",
    statusType: "success",
  },
  {
    id: 3,
    icon: "📦",
    title: "Donation Accepted",
    description: "An NGO has accepted your food donation.",
    time: "Today, 11:15 AM",
    status: "Accepted",
    statusType: "accepted",
  },
  {
    id: 4,
    icon: "🚚",
    title: "Pickup Scheduled",
    description: "Your donation pickup is scheduled for 4:30 PM.",
    time: "Today, 12:00 PM",
    status: "Scheduled",
    statusType: "scheduled",
  },
  {
    id: 5,
    icon: "✅",
    title: "Pickup Completed",
    description: "Your food donation was successfully picked up.",
    time: "Yesterday, 4:20 PM",
    status: "Completed",
    statusType: "success",
  },
];

function RecentActivity() {
  return (
    <div className="activity-list">
      {activities.map((activity) => (
        <div className="activity-card" key={activity.id}>
          <div className="activity-icon">
            {activity.icon}
          </div>

          <div className="activity-details">
            <h3>{activity.title}</h3>

            <p>{activity.description}</p>

            <span>{activity.time}</span>
          </div>

          <div
            className={`activity-status ${activity.statusType}`}
          >
            {activity.status}
          </div>
        </div>
      ))}
    </div>
  );
}

export default RecentActivity;