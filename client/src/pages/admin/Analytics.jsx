import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AnalyticsCard from "../../components/admin/AnalyticsCard";
import StatCard from "../../components/admin/StatCard";
import { getAnalytics } from "../../services/adminService";
import "./Analytics.css";

/**
 * Analytics
 * Route: /admin/analytics
 *
 * All figures on this page are MOCK / DEMO statistics until the real
 * analytics API is connected. The CO2 impact figure in particular is a
 * rough illustrative estimate, not a scientifically validated calculation.
 */
function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  return (
    <div className="admin-layout analytics-page">
      <AdminSidebar />
      <div className="admin-layout__main">
        <AdminNavbar adminName="Admin" notificationCount={3} />
        <main className="admin-layout__content">
          <div className="admin-page-header">
            <h1>Analytics</h1>
            <p>Platform-wide trends and impact. Demo data shown below.</p>
          </div>

          {loading || !data ? (
            <div className="analytics-page__loading">Loading analytics…</div>
          ) : (
            <>
              <span className="analytics-page__demo-tag">Demo data — not live figures</span>

              <section className="analytics-page__grid analytics-page__grid--two">
                <AnalyticsCard
                  title="Donations Over Time"
                  description="Monthly donation volume, last 6 months"
                  trend="+275%"
                  chart={{ type: "line", data: data.donationsOverTime }}
                />
                <AnalyticsCard
                  title="Food Saved Over Time"
                  description="Cumulative kg saved, last 6 months"
                  trend="+353%"
                  chart={{ type: "bar", data: data.foodSavedOverTime }}
                />
              </section>

              <section className="analytics-page__grid analytics-page__grid--two">
                <AnalyticsCard
                  title="Donation Categories"
                  description="Share of donations by food category"
                  chart={{ type: "donut", data: data.donationCategories }}
                />
                <AnalyticsCard
                  title="Donation Status Distribution"
                  description="Current donations by lifecycle stage"
                  chart={{ type: "bar", data: data.donationStatus }}
                />
              </section>

              <section className="analytics-page__grid analytics-page__grid--two">
                <AnalyticsCard
                  title="Pickup Completion"
                  value={`${data.pickupCompletion.rate}%`}
                  description={`${data.pickupCompletion.completed} of ${data.pickupCompletion.scheduled} scheduled pickups completed`}
                />
                <AnalyticsCard
                  title="NGO Activity"
                  description="Donations received per NGO"
                  chart={{ type: "bar", data: data.ngoActivity }}
                />
              </section>

              <section className="analytics-page__grid analytics-page__grid--one">
                <AnalyticsCard
                  title="User Growth"
                  description="Registered users, last 6 months"
                  trend="+52%"
                  chart={{ type: "line", data: data.userGrowth }}
                />
              </section>

              <section className="analytics-page__impact">
                <div className="admin-dashboard__section-header">
                  <h2>Monthly Impact</h2>
                  <span className="analytics-page__demo-tag">Demo / illustrative figures</span>
                </div>
                <div className="analytics-page__impact-grid">
                  <StatCard title="Food Saved" value={`${data.monthlyImpact.foodSaved.toLocaleString()} kg`} icon="⚘" />
                  <StatCard title="Successful Pickups" value={data.monthlyImpact.successfulPickups.toLocaleString()} icon="▲" />
                  <StatCard title="Active NGOs" value={data.monthlyImpact.activeNGOs.toLocaleString()} icon="◎" />
                  <StatCard title="Users" value={data.monthlyImpact.users.toLocaleString()} icon="◍" />
                  <StatCard title="Meals Supported" value={data.monthlyImpact.mealsSupported.toLocaleString()} icon="◈" />
                  <StatCard
                    title="CO₂ Impact"
                    value={`${data.monthlyImpact.co2Impact.toLocaleString()} kg CO2e`}
                    icon="◔"
                    description="Rough estimate, not scientifically validated"
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
