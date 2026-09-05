import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import './AdminNavbar.css';

export default function AdminNavbar() {
  const location = useLocation();
  
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/admin': return 'Dashboard';
      case '/admin/users': return 'User Management';
      case '/admin/ngos': return 'NGO Management';
      case '/admin/donations': return 'Donations';
      case '/admin/analytics': return 'Analytics';
      case '/admin/reports': return 'Reports';
      default: return 'Admin Panel';
    }
  };

  return (
    <header className="admin-navbar">
      <div className="navbar-left">
        <h2>{getPageTitle(location.pathname)}</h2>
      </div>
      
      <div className="navbar-right">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>
        
        <button className="notification-btn">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>
        
        <div className="admin-profile">
          <div className="avatar">A</div>
          <span className="admin-name">Admin User</span>
        </div>
      </div>
    </header>
  );
}
