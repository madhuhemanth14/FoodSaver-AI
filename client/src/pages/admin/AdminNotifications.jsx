import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import Notifications from "../dashboard/Notifications";
import { getUnreadCount } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin-theme.css";

export default function AdminNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getUnreadCount().then(setUnreadCount).catch(() => {});
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-layout__main">
        <AdminNavbar adminName={user?.name || "Admin"} notificationCount={unreadCount} />
        <main className="admin-layout__content admin-notifications-content">
          <Notifications />
        </main>
      </div>
    </div>
  );
}
