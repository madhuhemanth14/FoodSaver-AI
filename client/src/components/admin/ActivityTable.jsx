import { Package, Truck, Building2, User } from "lucide-react";
import "./ActivityTable.css";

const TYPE_ICON = {
  DONATION: <Package size={15} />,
  PICKUP: <Truck size={15} />,
  NGO: <Building2 size={15} />,
  USER: <User size={15} />,
};

/**
 * @param {{ activities: Array<{id:string,type:string,message:string,time:string}>, loading?: boolean }} props
 */
const ActivityTable = ({ activities = [], loading = false }) => {
  if (loading) {
    return <div className="activity-table__loading">Loading recent activity…</div>;
  }

  if (activities.length === 0) {
    return <div className="activity-table__empty">No recent activity.</div>;
  }

  return (
    <ul className="activity-table">
      {activities.map((item) => (
        <li key={item.id} className="activity-table__row">
          <span className="activity-table__icon" style={{ display: "inline-flex", alignItems: "center" }}>{TYPE_ICON[item.type] || "•"}</span>
          <span className="activity-table__message">{item.message}</span>
          <span className="activity-table__time">{item.time}</span>
        </li>
      ))}
    </ul>
  );
};

export default ActivityTable;
