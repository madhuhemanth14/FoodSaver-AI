import api from "./api";

/** GET /api/dashboard/stats — real MongoDB aggregates for the current user. */
export async function getDashboardStats() {
  const { data } = await api.get("/dashboard/stats");
  return data.stats;
}

/** GET /api/dashboard/overview — active donations, upcoming pickups, recent activity. */
export async function getDashboardOverview() {
  const { data } = await api.get("/dashboard/overview");
  return {
    activeDonations: data.activeDonations,
    upcomingPickups: data.upcomingPickups,
    recentActivity: data.recentActivity,
  };
}
