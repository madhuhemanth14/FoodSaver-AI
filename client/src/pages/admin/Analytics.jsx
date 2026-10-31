import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AnalyticsCard from "../../components/admin/AnalyticsCard";
import StatCard from "../../components/admin/StatCard";
import { getAnalytics } from "../../services/adminService";
import { getUnreadCount } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import { Leaf, Truck, Building2, Users, Utensils, Cloud, Calendar, Sparkles } from "lucide-react";
import "./Analytics.css";

const RANGE_TABS = [
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
  { key: "12m", label: "1 Year" },
  { key: "all", label: "All Time" },
];

/**
 * Analytics
 * Route: /admin/analytics
 * Executive visual analytics dashboard. Backed by live MongoDB database aggregations.
 */
function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAnalytics = async (selectedRange) => {
    setLoading(true);
    try {
      const [result, unread] = await Promise.all([
        getAnalytics(selectedRange).catch(() => null),
        getUnreadCount().catch(() => 0),
      ]);
      setData(result);
      setUnreadCount(unread);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

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
          <div className="admin-page-header analytics-page__header">
            <div>
              <div className="analytics-page__tag">
                <Sparkles size={14} color="#2e7d32" />
                <span>MongoDB Live Aggregations • Real-Time Metrics</span>
              </div>
              <h1>Platform Analytics</h1>
              <p>Visual trends, food redistribution velocity, and environmental impact.</p>
            </div>

            {/* Time range selector tabs */}
            <div className="analytics-page__range-tabs" role="tablist" aria-label="Select time range">
              {RANGE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={range === tab.key}
                  className={`analytics-page__range-btn ${range === tab.key ? "analytics-page__range-btn--active" : ""}`}
                  onClick={() => setRange(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="analytics-page__loading">Loading live platform analytics…</div>
          ) : (
            <>
              {/* Executive Impact Highlights Banner */}
              <section className="analytics-page__impact-banner">
                <div className="analytics-impact-item">
                  <div className="analytics-impact-item__icon">
                    <Leaf size={22} color="#2e7d32" />
                  </div>
                  <div className="analytics-impact-item__info">
                    <span className="analytics-impact-item__val">{(impact.foodSaved || 0).toLocaleString()} kg</span>
                    <span className="analytics-impact-item__label">Surplus Food Rescued</span>
                  </div>
                </div>

                <div className="analytics-impact-item">
                  <div className="analytics-impact-item__icon">
                    <Utensils size={22} color="#2e7d32" />
                  </div>
                  <div className="analytics-impact-item__info">
                    <span className="analytics-impact-item__val">{(impact.mealsSupported || 0).toLocaleString()}</span>
                    <span className="analytics-impact-item__label">Nutritious Meals Provided</span>
                  </div>
                </div>

                <div className="analytics-impact-item">
                  <div className="analytics-impact-item__icon">
                    <Cloud size={22} color="#2e7d32" />
                  </div>
                  <div className="analytics-impact-item__info">
                    <span className="analytics-impact-item__val">{(impact.co2Impact || 0).toLocaleString()} kg</span>
                    <span className="analytics-impact-item__label">CO₂ Emissions Offset</span>
                  </div>
                </div>

                <div className="analytics-impact-item">
                  <div className="analytics-impact-item__icon">
                    <Truck size={22} color="#2e7d32" />
                  </div>
                  <div className="analytics-impact-item__info">
                    <span className="analytics-impact-item__val">{pickup.completed || 0}</span>
                    <span className="analytics-impact-item__label">Logistics Pickups Fulfilled</span>
                  </div>
                </div>
              </section>

              {/* Row 1: Line & Bar Timeline Charts */}
              <section className="analytics-page__grid analytics-page__grid--two">
                <AnalyticsCard
                  title="Donations Over Time"
                  description="Daily donation listings across the selected time period"
                  chart={{ type: "line", data: safeData.donationsOverTime || [] }}
                  unit="donations"
                />
                <AnalyticsCard
                  title="Food Saved Over Time (kg)"
                  description="Cumulative weight of food rescued grouped by date"
                  chart={{ type: "bar", data: safeData.foodSavedOverTime || [] }}
                  unit="kg"
                />
              </section>

              {/* Row 2: Category Donut & Status Distribution */}
              <section className="analytics-page__grid analytics-page__grid--two">
                <AnalyticsCard
                  title="Donation Categories"
                  description="Breakdown of surplus food donations by dietary category"
                  chart={{ type: "donut", data: safeData.donationCategories || [] }}
                />
                <AnalyticsCard
                  title="Donation Lifecycle Status"
                  description="Current state of donations (Available, Completed, Expired)"
                  chart={{ type: "bar", data: safeData.donationStatus || [] }}
                />
              </section>

              {/* Row 3: Pickup Fulfillment & User Growth */}
              <section className="analytics-page__grid analytics-page__grid--two">
                <AnalyticsCard
                  title="Pickup Logistics Fulfillment"
                  description="Efficiency rate of scheduled donor pickups completed by partners"
                  progress={{
                    rate: pickup.rate || 0,
                    completed: pickup.completed || 0,
                    scheduled: pickup.scheduled || 0,
                  }}
                />
                <AnalyticsCard
                  title="User Base Growth"
                  description="Cumulative donor and NGO registrations over time"
                  chart={{ type: "line", data: safeData.userGrowth || [] }}
                  unit="users"
                />
              </section>

              {/* Row 4: Partner NGO Network Activity */}
              <section className="analytics-page__grid analytics-page__grid--one">
                <AnalyticsCard
                  title="Partner NGO Network Activity"
                  description="Verified NGO partners and donations allocated for local community distribution"
                  chart={{ type: "bar", data: safeData.ngoActivity || [] }}
                  unit="assigned"
                />
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Analytics;
