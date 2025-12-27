import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import coreService from '../services/core';
import useAuth from '../hooks/useAuth';

const MaintenanceList = () => {
  const { isAdmin, isTechnician, user } = useAuth();
  const navigate = useNavigate();
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaintenanceList();
  }, []);

  const fetchMaintenanceList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coreService.getMaintenanceList();
      setMaintenanceList(data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view maintenance requests.');
      } else {
        setError('Failed to fetch maintenance requests.');
      }
      console.error("Error fetching maintenance list:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id) => {
    navigate(`/maintenance/${id}`);
  };

  if (loading) {
    return <div className="text-center py-8">Loading maintenance requests...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  const filteredMaintenanceList = maintenanceList.filter(maintenance => {
    if (isAdmin) return true;
    // Assuming user ID in auth corresponds to created_by_id
    if (isTechnician && user?.id === maintenance.assigned_technician) return true;
    return false;
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Maintenance Requests</h2>
      <p className="text-gray-600 mb-6">Overview of all maintenance tasks.</p>

      {filteredMaintenanceList.length === 0 ? (
        <p className="text-gray-600">No maintenance requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Technician</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Date/Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaintenanceList.map((maintenance) => (
                <tr
                  key={maintenance.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleRowClick(maintenance.id)}
                >
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{maintenance.title}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{maintenance.equipment_name}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{maintenance.status}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{maintenance.priority}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{maintenance.assigned_technician_email || 'N/A'}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{new Date(maintenance.scheduled_start).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MaintenanceList;
