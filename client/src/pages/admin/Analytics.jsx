import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AnalyticsCard from "../../components/admin/AnalyticsCard";
import StatCard from "../../components/admin/StatCard";
import { getAnalytics } from "../../services/adminService";
import { getUnreadCount } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import { Leaf, Truck, Building2, Users, Utensils, Cloud } from "lucide-react";
import "./Analytics.css";

/**
 * Analytics
 * Route: /admin/analytics
 */
function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getAnalytics().catch(() => null),
      getUnreadCount().catch(() => 0),
    ]).then(([result, unread]) => {
      if (isMounted) {
        setData(result);
        setUnreadCount(unread);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const safeData = data || {};
  const pickup = safeData.pickupCompletion || { rate: 0, completed: 0, scheduled: 0 };
  const impact = safeData.monthlyImpact || {
    foodSaved: 0,
    successfulPickups: 0,
    activeNGOs: 0,
    users: 0,
    mealsSupported: 0,
    co2Impact: 0,
  };

  return (
    <div className="admin-layout analytics-page">
      <AdminSidebar />
      <div className="admin-layout__main">
        <AdminNavbar admin={user} unreadCount={unreadCount} />
        <main className="admin-layout__content">
          <div className="admin-page-header">
            <div>
              <h1>Analytics</h1>
              <p>Platform-wide trends and live impact overview from MongoDB.</p>
            </div>
          </div>

          {loading ? (
            <div className="analytics-page__loading">Loading analytics…</div>
          ) : (
            <>
              <section className="analytics-page__grid analytics-page__grid--two">
                <AnalyticsCard
                  title="Donations Over Time"
                  description="Donation volume by date"
                  chart={{ type: "line", data: safeData.donationsOverTime || [] }}
                />
                <AnalyticsCard
                  title="Food Saved Over Time"
                  description="Cumulative kg saved by date"
                  chart={{ type: "bar", data: safeData.foodSavedOverTime || [] }}
                />
              </section>

              <section className="analytics-page__grid analytics-page__grid--two">
                <AnalyticsCard
                  title="Donation Categories"
                  description="Share of donations by food category"
                  chart={{ type: "donut", data: safeData.donationCategories || [] }}
                />
                <AnalyticsCard
                  title="Donation Status Distribution"
                  description="Current donations by lifecycle stage"
                  chart={{ type: "bar", data: safeData.donationStatus || [] }}
                />
              </section>

              <section className="analytics-page__grid analytics-page__grid--two">
                <AnalyticsCard
                  title="Pickup Completion"
                  value={`${pickup.rate || 0}%`}
                  description={`${pickup.completed || 0} of ${pickup.scheduled || 0} scheduled pickups completed`}
                />
                <AnalyticsCard
                  title="NGO Activity"
                  description="Donations processed per NGO"
                  chart={{ type: "bar", data: safeData.ngoActivity || [] }}
                />
              </section>

              <section className="analytics-page__grid analytics-page__grid--one">
                <AnalyticsCard
                  title="User Growth"
                  description="Platform user registrations by date"
                  chart={{ type: "line", data: safeData.userGrowth || [] }}
                />
              </section>

              <section className="analytics-page__impact">
                <div className="admin-dashboard__section-header">
                  <h2>Monthly Impact</h2>
                </div>
                <div className="analytics-page__impact-grid">
                  <StatCard title="Food Saved" value={`${(impact.foodSaved || 0).toLocaleString()} kg`} icon={<Leaf size={18} />} />
                  <StatCard title="Successful Pickups" value={(impact.successfulPickups || 0).toLocaleString()} icon={<Truck size={18} />} />
                  <StatCard title="Active NGOs" value={(impact.activeNGOs || 0).toLocaleString()} icon={<Building2 size={18} />} />
                  <StatCard title="Users" value={(impact.users || 0).toLocaleString()} icon={<Users size={18} />} />
                  <StatCard title="Meals Supported" value={(impact.mealsSupported || 0).toLocaleString()} icon={<Utensils size={18} />} />
                  <StatCard
                    title="CO₂ Impact"
                    value={`${(impact.co2Impact || 0).toLocaleString()} kg CO2e`}
                    icon={<Cloud size={18} />}
                    description="Estimated carbon offset"
                  />
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Analytics;
