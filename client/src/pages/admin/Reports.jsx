import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import StatCard from "../../components/admin/StatCard";
import { getReports } from "../../services/adminService";
import { Package, CheckCircle2, XCircle, Leaf, Truck, Building2, Users, UserCheck } from "lucide-react";
import "./Reports.css";

/**
 * Reports
 * Route: /admin/reports
 *
 * Export buttons are mock UI only — no CSV/PDF generation library is wired
 * up, since the base project does not currently include one. Wire these to
 * a real export flow once the backend endpoint (or an approved library)
 * is available.
 */
function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportMessage, setExportMessage] = useState("");

  useEffect(() => {
    getReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  const handleExport = (format) => {
    setExportMessage(`Export as ${format} will be connected to backend later.`);
    window.setTimeout(() => setExportMessage(""), 4000);
  };

  return (
    <div className="admin-layout reports-page">
      <AdminSidebar />
      <div className="admin-layout__main">
        <AdminNavbar adminName="Admin" notificationCount={3} />
        <main className="admin-layout__content">
          <div className="admin-page-header reports-page__header">
            <div>
              <h1>Reports</h1>
              <p>Snapshot summaries you can export for stakeholders.</p>
            </div>
            <div className="reports-page__export-actions">
              <button type="button" className="row-actions__btn" onClick={() => handleExport("CSV")}>
                Export CSV
              </button>
              <button type="button" className="row-actions__btn" onClick={() => handleExport("PDF")}>
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
                  <StatCard title="Total Donations" value={reports.donationReport.totalDonations.toLocaleString()} icon={<Package size={18} />} />
                  <StatCard title="Completed Donations" value={reports.donationReport.completedDonations.toLocaleString()} icon={<CheckCircle2 size={18} />} />
                  <StatCard title="Cancelled Donations" value={reports.donationReport.cancelledDonations.toLocaleString()} icon={<XCircle size={18} />} />
                  <StatCard title="Food Saved" value={`${reports.donationReport.foodSaved.toLocaleString()} kg`} icon={<Leaf size={18} />} />
                  <StatCard title="Successful Pickups" value={reports.donationReport.successfulPickups.toLocaleString()} icon={<Truck size={18} />} />
                  <StatCard title="Active NGOs" value={reports.donationReport.activeNGOs.toLocaleString()} icon={<Building2 size={18} />} />
                </div>
              </section>

              <section className="reports-page__section">
                <h2>User Report</h2>
                <div className="reports-page__grid">
                  <StatCard title="Total Users" value={reports.userReport.totalUsers.toLocaleString()} icon={<Users size={18} />} />
                  <StatCard title="Active Users" value={reports.userReport.activeUsers.toLocaleString()} icon={<UserCheck size={18} />} />
                  <StatCard title="NGO Users" value={reports.userReport.ngoUsers.toLocaleString()} icon={<Building2 size={18} />} />
                  <StatCard title="Donors" value={reports.userReport.donors.toLocaleString()} icon={<Users size={18} />} />
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
