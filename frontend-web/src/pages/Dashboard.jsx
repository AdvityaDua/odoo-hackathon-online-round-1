import React from 'react';
import STATIC_DATA from '../utils/staticData';

const Dashboard = () => {
  // Calculate insights from static data
  const totalCompanies = STATIC_DATA.companies.length;
  const totalDepartments = STATIC_DATA.departments.length;
  const totalEquipment = STATIC_DATA.equipment.length;
  const totalWorkCenters = STATIC_DATA.work_centers.length;
  const totalUsers = STATIC_DATA.users.length;
  const totalMaintenanceRequests = STATIC_DATA.maintenance_requests.length;

  const maintenanceByStatus = STATIC_DATA.maintenance_requests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {});

  const maintenanceByPriority = STATIC_DATA.maintenance_requests.reduce((acc, request) => {
    acc[request.priority] = (acc[request.priority] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Overview</h2>
      <p className="text-gray-600 mb-6">A quick glance at your GearGuard system metrics.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-100 p-4 rounded-lg shadow-sm text-indigo-800">
          <h3 className="font-semibold text-lg mb-1">Total Companies</h3>
          <p className="text-3xl font-bold">{totalCompanies}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg shadow-sm text-blue-800">
          <h3 className="font-semibold text-lg mb-1">Total Departments</h3>
          <p className="text-3xl font-bold">{totalDepartments}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow-sm text-green-800">
          <h3 className="font-semibold text-lg mb-1">Total Equipment</h3>
          <p className="text-3xl font-bold">{totalEquipment}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow-sm text-yellow-800">
          <h3 className="font-semibold text-lg mb-1">Total Work Centers</h3>
          <p className="text-3xl font-bold">{totalWorkCenters}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow-sm text-purple-800">
          <h3 className="font-semibold text-lg mb-1">Total Users</h3>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </div>
        <div className="bg-pink-100 p-4 rounded-lg shadow-sm text-pink-800">
          <h3 className="font-semibold text-lg mb-1">Total Maintenance Requests</h3>
          <p className="text-3xl font-bold">{totalMaintenanceRequests}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Maintenance by Status</h3>
          <ul className="space-y-2">
            {Object.entries(maintenanceByStatus).map(([status, count]) => (
              <li key={status} className="flex justify-between items-center bg-white p-3 rounded-md shadow-xs">
                <span className="font-medium text-gray-700">{status.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}</span>
                <span className="px-3 py-1 bg-gray-200 text-gray-800 text-sm font-semibold rounded-full">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Maintenance by Priority</h3>
          <ul className="space-y-2">
            {Object.entries(maintenanceByPriority).map(([priority, count]) => {
              let bgColorClass = 'bg-gray-200';
              let textColorClass = 'text-gray-800';
              if (priority === 'low') bgColorClass = 'bg-gray-500 text-white';
              if (priority === 'medium') bgColorClass = 'bg-blue-500 text-white';
              if (priority === 'high') bgColorClass = 'bg-orange-500 text-white';
              if (priority === 'critical') bgColorClass = 'bg-red-500 text-white';

              return (
                <li key={priority} className="flex justify-between items-center bg-white p-3 rounded-md shadow-xs">
                  <span className="font-medium text-gray-700">{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                  <span className={`${bgColorClass} px-3 py-1 text-sm font-semibold rounded-full`}>{count}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
