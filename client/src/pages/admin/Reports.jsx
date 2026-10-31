import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import StatCard from "../../components/admin/StatCard";
import { getReports } from "../../services/adminService";
import { getUnreadCount } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import { Package, CheckCircle2, XCircle, Leaf, Truck, Building2, Users, UserCheck } from "lucide-react";
import "./Reports.css";

/**
 * Reports
 * Route: /admin/reports
 */
function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportMessage, setExportMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getReports().catch(() => null),
      getUnreadCount().catch(() => 0),
    ]).then(([data, unread]) => {
      if (isMounted) {
        setReports(data);
        setUnreadCount(unread);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const dRep = reports?.donationReport || {
    totalDonations: 0,
    completedDonations: 0,
    cancelledDonations: 0,
    foodSaved: 0,
    successfulPickups: 0,
    activeNGOs: 0,
  };

  const uRep = reports?.userReport || {
    totalUsers: 0,
    activeUsers: 0,
    ngoUsers: 0,
    donors: 0,
  };

  const handleExportCSV = () => {
    try {
      const rows = [
        ["FoodSaver AI - Operational & Impact Report"],
        ["Generated Date", new Date().toLocaleString()],
        [],
        ["Metric Category", "Metric", "Value"],
        ["Donations", "Total Donations", dRep.totalDonations],
        ["Donations", "Completed Donations", dRep.completedDonations],
        ["Donations", "Cancelled Donations", dRep.cancelledDonations],
        ["Donations", "Food Saved (kg)", dRep.foodSaved],
        ["Donations", "Successful Pickups", dRep.successfulPickups],
        ["Donations", "Active Partner NGOs", dRep.activeNGOs],
        ["Users", "Total Registered Users", uRep.totalUsers],
        ["Users", "Active Users", uRep.activeUsers],
        ["Users", "NGO Accounts", uRep.ngoUsers],
        ["Users", "Donor Accounts", uRep.donors],
      ];

      const csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `foodsaver_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportMessage("CSV report downloaded successfully.");
      setTimeout(() => setExportMessage(""), 4000);
    } catch {
      setExportMessage("Unable to generate CSV at this moment.");
      setTimeout(() => setExportMessage(""), 4000);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="admin-layout reports-page">
      <AdminSidebar />
      <div className="admin-layout__main">
        <AdminNavbar admin={user} unreadCount={unreadCount} />
        <main className="admin-layout__content">
          <div className="admin-page-header reports-page__header">
            <div>
              <h1>Reports</h1>
              <p>Operational snapshot and stakeholder impact reports.</p>
            </div>
            <div className="reports-page__export-actions">
              <button type="button" className="row-actions__btn" onClick={handleExportCSV}>
                Export CSV
              </button>
              <button type="button" className="row-actions__btn" onClick={handleExportPDF}>
                Export PDF
              </button>
            </div>
          </div>

          {exportMessage && <div className="reports-page__export-note">{exportMessage}</div>}

          {loading || !reports ? (
            <div className="reports-page__loading">Loading reports…</div>
          ) : (
            <>
              <section className="reports-page__section">
                <h2>Donation Report</h2>
                <div className="reports-page__grid">
                  <StatCard title="Total Donations" value={(dRep.totalDonations || 0).toLocaleString()} icon={<Package size={18} />} />
                  <StatCard title="Completed Donations" value={(dRep.completedDonations || 0).toLocaleString()} icon={<CheckCircle2 size={18} />} />
                  <StatCard title="Cancelled Donations" value={(dRep.cancelledDonations || 0).toLocaleString()} icon={<XCircle size={18} />} />
                  <StatCard title="Food Saved" value={`${(dRep.foodSaved || 0).toLocaleString()} kg`} icon={<Leaf size={18} />} />
                  <StatCard title="Successful Pickups" value={(dRep.successfulPickups || 0).toLocaleString()} icon={<Truck size={18} />} />
                  <StatCard title="Active NGOs" value={(dRep.activeNGOs || 0).toLocaleString()} icon={<Building2 size={18} />} />
                </div>
              </section>

              <section className="reports-page__section">
                <h2>User Report</h2>
                <div className="reports-page__grid">
                  <StatCard title="Total Users" value={(uRep.totalUsers || 0).toLocaleString()} icon={<Users size={18} />} />
                  <StatCard title="Active Users" value={(uRep.activeUsers || 0).toLocaleString()} icon={<UserCheck size={18} />} />
                  <StatCard title="NGO Users" value={(uRep.ngoUsers || 0).toLocaleString()} icon={<Building2 size={18} />} />
                  <StatCard title="Donors" value={(uRep.donors || 0).toLocaleString()} icon={<Users size={18} />} />
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Reports;
