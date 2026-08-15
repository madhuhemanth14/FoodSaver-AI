import WelcomeCard from "../../components/dashboard/WelcomeCard";
import StatCard from "../../components/dashboard/StatCard";
import RecentActivity from "../../components/dashboard/RecentActivity";
import QuickActions from "../../components/dashboard/QuickActions";
import DonationSummary from "../../components/dashboard/DonationSummary";
import "./Dashboard.css";

const stats = [
  { icon: "🍽️", label: "Total Donations", value: 128, accent: "green" },
  { icon: "🌱", label: "Food Saved (kg)", value: "45 kg", accent: "blue" },
  { icon: "✅", label: "Successful Pickups", value: 96, accent: "amber" },
  { icon: "🍛", label: "Meals Supported", value: 340, accent: "purple" },
];

/**
 * Member 5 — Dashboard page.
 * Uses mock data; wire up real API calls once available.
 */
const Dashboard = () => {
  return (
    <div className="dashboard">
      <WelcomeCard name="Yamini" kgSaved={45} />

      <div className="dashboard__stats">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            accent={stat.accent}
          />
        ))}
      </div>

      <div className="dashboard__main-grid">
        <div className="dashboard__main-col">
          <QuickActions />
          <RecentActivity />
        </div>
        <div className="dashboard__side-col">
          <DonationSummary />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
