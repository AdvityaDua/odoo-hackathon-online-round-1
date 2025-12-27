import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import useAuth from '../hooks/useAuth';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', roles: ['admin', 'user', 'technician'] },
    { to: '/companies', label: 'Companies', roles: ['admin'] },
    { to: '/departments', label: 'Departments', roles: ['admin', 'user', 'technician'] },
    { to: '/equipment-categories', label: 'Equipment Categories', roles: ['admin', 'user', 'technician'] },
    { to: '/equipment', label: 'Equipment', roles: ['admin', 'user', 'technician'] },
    { to: '/work-centers', label: 'Work Centers', roles: ['admin', 'user', 'technician'] },
    { to: '/maintenance', label: 'Maintenance List', roles: ['admin', 'user', 'technician'] },
    { to: '/maintenance/create', label: 'Create Maintenance', roles: ['admin', 'user'] },
    { to: '/maintenance/kanban', label: 'Maintenance Kanban', roles: ['admin', 'user', 'technician'] },
    { to: '/maintenance/calendar', label: 'Maintenance Calendar', roles: ['admin', 'user', 'technician'] },
  ];

  const currentUser = authService.getCurrentUser();
  const userRoles = currentUser ? (currentUser.roles && currentUser.roles.length > 0 ? currentUser.roles : ['user']) : [];

  const filteredNavLinks = navLinks.filter(link =>
    link.roles.some(role => userRoles.includes(role))
  );

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
        <div className="text-3xl font-extrabold mb-8 text-center text-indigo-300">
          GearGuard
        </div>
        <nav className="flex-1 space-y-2">
          {filteredNavLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
          <h1 className="text-2xl font-semibold text-gray-800">Admin Portal</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

