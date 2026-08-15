import "./RecentActivity.css";

const mockActivity = [
  {
    id: 1,
    title: "Donation accepted",
    description: "Hope Kitchen NGO accepted your rice donation.",
    time: "10 minutes ago",
    icon: "✅",
  },
  {
    id: 2,
    title: "Pickup scheduled",
    description: "Volunteer pickup scheduled for 5:00 PM today.",
    time: "35 minutes ago",
    icon: "🚚",
  },
  {
    id: 3,
    title: "Food analysis completed",
    description: "AI identified 3.2 kg of surplus vegetables.",
    time: "1 hour ago",
    icon: "🤖",
  },
  {
    id: 4,
    title: "Donation delivered",
    description: "Your donation reached 40 people at Green Earth NGO.",
    time: "Yesterday",
    icon: "📦",
  },
];

/**
 * Timeline of the user's recent activity.
 */
const RecentActivity = () => {
  return (
    <div className="recent-activity">
      <h2 className="recent-activity__title">Recent Activity</h2>
      <ul className="recent-activity__timeline">
        {mockActivity.map((item) => (
          <li key={item.id} className="recent-activity__item">
            <span className="recent-activity__icon">{item.icon}</span>
            <div className="recent-activity__body">
              <p className="recent-activity__item-title">{item.title}</p>
              <p className="recent-activity__item-desc">{item.description}</p>
              <span className="recent-activity__time">{item.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
