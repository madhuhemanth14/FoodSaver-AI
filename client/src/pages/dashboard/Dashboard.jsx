import "./Dashboard.css";

import WelcomeCard from "../../components/dashboard/WelcomeCard";
import StatCard from "../../components/dashboard/StatCard";
import RecentActivity from "../../components/dashboard/RecentActivity";
import QuickActions from "../../components/dashboard/QuickActions";

import { FaBell } from "react-icons/fa";

function Dashboard() {
  return (
    <div className="dashboard">

      <div className="header">
        <h1>FoodSaver AI</h1>

        <div className="notification">
          <FaBell />
        </div>
      </div>

      <WelcomeCard />

      <div className="stats">
        <StatCard
          title="Total Donations"
          value="25"
        />

        <StatCard
          title="Meals Served"
          value="1240"
        />

        <StatCard
          title="Food Saved"
          value="330 Kg"
        />

        <StatCard
          title="CO₂ Reduced"
          value="256 Kg"
        />
      </div>

      <QuickActions />

      <RecentActivity />

    </div>
  );
}

export default Dashboard;