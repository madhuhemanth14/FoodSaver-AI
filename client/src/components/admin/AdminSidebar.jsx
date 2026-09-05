import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Gift, BarChart3, FileText, LogOut, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminSidebar.css';

export default function AdminSidebar() {
  const { logout } = useAuth();

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/ngos', icon: Building2, label: 'NGO Management' },
    { path: '/admin/donations', icon: Gift, label: 'Donations' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' }
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <Leaf className="logo-icon" size={28} />
        <span className="logo-text">FoodSaver AI</span>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
