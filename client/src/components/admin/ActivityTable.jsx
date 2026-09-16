import React from 'react';
import './ActivityTable.css';
import { FileText } from 'lucide-react';

export default function ActivityTable({ activities = [], loading = false }) {
  if (loading) {
    return (
      <div className="activity-table-container">
        <table className="activity-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Description</th>
              <th>User</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map(i => (
              <tr key={i} className="skeleton-row">
                <td><div className="skeleton-box"></div></td>
                <td><div className="skeleton-box"></div></td>
                <td><div className="skeleton-box large"></div></td>
                <td><div className="skeleton-box"></div></td>
                <td><div className="skeleton-box"></div></td>
                <td><div className="skeleton-box small"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="empty-state">
        <FileText size={48} color="#ccc" />
        <p>No recent activity found.</p>
      </div>
    );
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'delivered':
      case 'completed':
      case 'success':
        return 'status-green';
      case 'pending':
      case 'processing':
        return 'status-yellow';
      case 'cancelled':
      case 'failed':
        return 'status-red';
      default:
        return 'status-gray';
    }
  };

  return (
    <div className="activity-table-container">
      <table className="activity-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Description</th>
            <th>User</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id}>
              <td className="fw-500">#{activity.id}</td>
              <td>
                <span className="type-badge">{activity.type}</span>
              </td>
              <td className="desc-col">{activity.description}</td>
              <td>{activity.user}</td>
              <td className="date-col">
                {new Date(activity.timestamp).toLocaleString()}
              </td>
              <td>
                <span className={`status-badge ${getStatusClass(activity.status)}`}>
                  {activity.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
