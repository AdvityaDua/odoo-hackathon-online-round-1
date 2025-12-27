import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import coreService from '../services/core';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const MaintenanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isTechnician, user } = useAuth();
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workLogs, setWorkLogs] = useState([]);
  const [showWorkLogForm, setShowWorkLogForm] = useState(false);
  const [workLogNote, setWorkLogNote] = useState('');
  const [workLogStatus, setWorkLogStatus] = useState('');
  const [workLogFormError, setWorkLogFormError] = useState(null);
  const [workLogFormLoading, setWorkLogFormLoading] = useState(false);
  const [showReassignForm, setShowReassignForm] = useState(false);
  const [newTeamId, setNewTeamId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [reassignFormError, setReassignFormError] = useState(null);
  const [reassignFormLoading, setReassignFormLoading] = useState(false);

  const isAssignedTechnician = user && maintenance && isTechnician && user.id === maintenance.assigned_technician;
  const isCompletedOrCancelled = maintenance && (maintenance.status === 'completed' || maintenance.status === 'cancelled');

  useEffect(() => {
    fetchMaintenanceDetail();
    fetchWorkLogs();
  }, [id]);

  const fetchMaintenanceDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coreService.getMaintenanceDetail(id);
      setMaintenance(data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view this maintenance request.');
      } else {
        setError('Failed to fetch maintenance details.');
      }
      console.error("Error fetching maintenance detail for ID:", id, err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkLogs = async () => {
    try {
      const data = await coreService.getWorkLogs(id);
      setWorkLogs(data);
    } catch (err) {
      console.error("Error fetching work logs:", err.response?.data || err.message);
    }
  };

  const handleWorkLogSubmit = async (e) => {
    e.preventDefault();
    setWorkLogFormLoading(true);
    setWorkLogFormError(null);
    try {
      await coreService.postWorkLog({
        maintenance_id: id,
        note: workLogNote,
        status: workLogStatus,
      });
      setShowWorkLogForm(false);
      setWorkLogNote('');
      setWorkLogStatus('');
      fetchMaintenanceDetail();
      fetchWorkLogs();
    } catch (err) {
      setWorkLogFormError(err.response?.data?.detail || 'Failed to add work log.');
    } finally {
      setWorkLogFormLoading(false);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    setReassignFormLoading(true);
    setReassignFormError(null);
    try {
      await coreService.postReassign({
        maintenance_id: id,
        new_team: newTeamId,
        reason: reassignReason,
      });
      setShowReassignForm(false);
      setNewTeamId('');
      setReassignReason('');
      fetchMaintenanceDetail();
    } catch (err) {
      setReassignFormError(err.response?.data?.detail || 'Failed to reassign technician.');
    } finally {
      setReassignFormLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading maintenance details...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  if (!maintenance) {
    return <div className="text-center py-8">Maintenance request not found.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Maintenance Request: {maintenance.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-600"><span className="font-semibold">Description:</span> {maintenance.description}</p>
          <p className="text-gray-600"><span className="font-semibold">Type:</span> {maintenance.maintenance_type}</p>
          <p className="text-gray-600"><span className="font-semibold">Equipment:</span> {maintenance.equipment_name}</p>
          <p className="text-gray-600"><span className="font-semibold">Work Center:</span> {maintenance.work_center_name}</p>
          <p className="text-gray-600"><span className="font-semibold">Status:</span> {maintenance.status}</p>
        </div>
        <div>
          <p className="text-gray-600"><span className="font-semibold">Priority:</span> {maintenance.priority}</p>
          <p className="text-gray-600"><span className="font-semibold">Assigned Team:</span> {maintenance.assigned_team_name}</p>
          <p className="text-gray-600"><span className="font-semibold">Assigned Technician:</span> {maintenance.assigned_technician_email || 'N/A'}</p>
          <p className="text-gray-600"><span className="font-semibold">Scheduled Start:</span> {new Date(maintenance.scheduled_start).toLocaleString()}</p>
          <p className="text-gray-600"><span className="font-semibold">Duration:</span> {maintenance.duration_hours} hours</p>
        </div>
      </div>

      {/* Work Log Form (Technician Only, not completed/cancelled) */}
      {isTechnician && isAssignedTechnician && !isCompletedOrCancelled && (
        <div className="mt-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Log Work</h3>
          <form onSubmit={handleWorkLogSubmit} className="space-y-4">
            <div>
              <label htmlFor="workLogNote" className="block text-sm font-medium text-gray-700">Note</label>
              <textarea
                id="workLogNote"
                rows="3"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={workLogNote}
                onChange={(e) => setWorkLogNote(e.target.value)}
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="workLogStatus" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="workLogStatus"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={workLogStatus}
                onChange={(e) => setWorkLogStatus(e.target.value)}
                required
              >
                <option value="">Select Status</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            {workLogFormError && <p className="text-red-600 text-sm">{workLogFormError}</p>}
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-colors duration-200"
              disabled={workLogFormLoading}
            >
              {workLogFormLoading ? 'Logging...' : 'Add Work Log'}
            </button>
          </form>
        </div>
      )}

      {/* Reassign Form (Technician Only, not completed/cancelled) */}
      {isTechnician && isAssignedTechnician && !isCompletedOrCancelled && (
        <div className="mt-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Reassign Technician</h3>
          <form onSubmit={handleReassignSubmit} className="space-y-4">
            <div>
              <label htmlFor="newTeamId" className="block text-sm font-medium text-gray-700">New Team ID</label>
              <input
                type="number"
                id="newTeamId"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={newTeamId}
                onChange={(e) => setNewTeamId(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="reassignReason" className="block text-sm font-medium text-gray-700">Reason</label>
              <textarea
                id="reassignReason"
                rows="2"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                required
              ></textarea>
            </div>
            {reassignFormError && <p className="text-red-600 text-sm">{reassignFormError}</p>}
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-600 text-white rounded-md shadow hover:bg-yellow-700 transition-colors duration-200"
              disabled={reassignFormLoading}
            >
              {reassignFormLoading ? 'Reassigning...' : 'Reassign Technician'}
            </button>
          </form>
        </div>
      )}

      {/* Work Log Timeline */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Work Log Timeline</h3>
        {workLogs.length === 0 ? (
          <p className="text-gray-600">No work logs available.</p>
        ) : (
          <div className="space-y-4">
            {workLogs.map((log) => (
              <div key={log.id} className="p-4 border rounded-md bg-gray-50">
                <p className="text-sm font-medium text-gray-900">Technician: {log.technician_email}</p>
                <p className="text-sm text-gray-700">Status: {log.status}</p>
                <p className="text-sm text-gray-700">Note: {log.note}</p>
                <p className="text-xs text-gray-500">Timestamp: {new Date(log.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default MaintenanceDetail;
