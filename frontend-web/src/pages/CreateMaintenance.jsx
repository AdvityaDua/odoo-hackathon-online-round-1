import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import coreService from '../services/core';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const CreateMaintenance = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('preventive');
  const [priority, setPriority] = useState('low');
  const [equipmentId, setEquipmentId] = useState('');
  const [maintenanceTeamId, setMaintenanceTeamId] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [durationHours, setDurationHours] = useState('1');

  const [availableWorkCenters, setAvailableWorkCenters] = useState([]);
  const [assignedTechnician, setAssignedTechnician] = useState(null);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState('');

  const [equipmentSelect, setEquipmentSelect] = useState([]);
  const [maintenanceTeamsSelect, setMaintenanceTeamsSelect] = useState([]); // Assuming an API for this

  useEffect(() => {
    if (!user || (!isAdmin && user.roles && user.roles.includes('technician'))) {
      // Only Admin and User roles can create maintenance
      navigate('/dashboard');
    }
    fetchSelectData();
  }, [user, isAdmin, navigate]);

  const fetchSelectData = async () => {
    try {
      const [equipmentRes, teamsRes] = await Promise.all([
        coreService.fetchEquipmentSelect(),
        // Assuming a new API for fetching maintenance teams for select dropdowns
        // For now, let's mock it or use an existing one if available.
        // If not, we'll need to add it to coreService.
        // api.get('/api/maintenance/teams/select/'), // Placeholder if needed
        Promise.resolve([{ id: 1, name: 'Team A' }, { id: 2, name: 'Team B' }]), // Mock data
      ]);
      setEquipmentSelect(equipmentRes);
      setMaintenanceTeamsSelect(teamsRes); // Assuming teamsRes.data if from API
    } catch (err) {
      console.error("Error fetching select data:", err);
    }
  };

  const handleAvailabilityCheck = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    setAvailableWorkCenters([]);
    setAssignedTechnician(null);
    setSelectedWorkCenter('');

    try {
      const payload = {
        equipment: parseInt(equipmentId),
        maintenance_team: parseInt(maintenanceTeamId),
        scheduled_start: scheduledStart,
        duration_hours: parseInt(durationHours),
      };
      const response = await coreService.postMaintenanceAvailability(payload);
      setAvailableWorkCenters(response.available_work_centers);
      setAssignedTechnician(response.assigned_technician);
      if (response.available_work_centers.length === 0) {
        setError('No available work centers for the selected criteria.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to check availability.');
      console.error("Availability check error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (availableWorkCenters.length === 0 || !assignedTechnician || !selectedWorkCenter) {
      setError('Please check availability and select a work center.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title,
        description,
        maintenance_type: maintenanceType,
        priority,
        equipment: parseInt(equipmentId),
        work_center: parseInt(selectedWorkCenter),
        assigned_team: parseInt(maintenanceTeamId),
        assigned_technician: assignedTechnician.id,
        scheduled_start: scheduledStart,
        duration_hours: parseInt(durationHours),
      };
      await coreService.postMaintenanceRequest(payload);
      setSuccess('Maintenance request created successfully!');
      setTimeout(() => navigate('/maintenance'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create maintenance request.');
      console.error("Create maintenance error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Maintenance Request</h2>
      <p className="text-gray-600 mb-6">Plan and schedule new maintenance tasks.</p>

      <form onSubmit={handleCreateMaintenance} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" id="title" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
          </div>
          <div>
            <label htmlFor="maintenanceType" className="block text-sm font-medium text-gray-700">Maintenance Type</label>
            <select id="maintenanceType" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={maintenanceType} onChange={(e) => setMaintenanceType(e.target.value)} required>
              <option value="preventive">Preventive</option>
              <option value="corrective">Corrective</option>
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
            <select id="priority" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={priority} onChange={(e) => setPriority(e.target.value)} required>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-700">Equipment</label>
            <select id="equipmentId" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} required>
              <option value="">Select Equipment</option>
              {equipmentSelect.map(eq => (<option key={eq.id} value={eq.id}>{eq.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="maintenanceTeamId" className="block text-sm font-medium text-gray-700">Maintenance Team</label>
            <select id="maintenanceTeamId" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={maintenanceTeamId} onChange={(e) => setMaintenanceTeamId(e.target.value)} required>
              <option value="">Select Team</option>
              {maintenanceTeamsSelect.map(team => (<option key={team.id} value={team.id}>{team.name}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="scheduledStart" className="block text-sm font-medium text-gray-700">Scheduled Start</label>
            <input type="datetime-local" id="scheduledStart" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={scheduledStart} onChange={(e) => setScheduledStart(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="durationHours" className="block text-sm font-medium text-gray-700">Duration (Hours)</label>
            <input type="number" id="durationHours" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} min="1" required />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAvailabilityCheck}
          className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors duration-200"
          disabled={loading || !equipmentId || !maintenanceTeamId || !scheduledStart || !durationHours}
        >
          {loading ? 'Checking...' : 'Check Availability'}
        </button>

        {availableWorkCenters.length > 0 && assignedTechnician && (
          <div className="mt-6 p-4 border rounded-md bg-green-50 text-green-800">
            <p className="font-semibold">Availability Confirmed!</p>
            <p>Assigned Technician: {assignedTechnician.email}</p>
            <div className="mt-2">
              <label htmlFor="selectedWorkCenter" className="block text-sm font-medium text-green-800">Select Work Center</label>
              <select
                id="selectedWorkCenter"
                className="mt-1 block w-full border border-green-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white text-gray-900"
                value={selectedWorkCenter}
                onChange={(e) => setSelectedWorkCenter(e.target.value)}
                required
              >
                <option value="">Select an available Work Center</option>
                {availableWorkCenters.map(wc => (<option key={wc.id} value={wc.id}>{wc.name}</option>))}
              </select>
            </div>
          </div>
        )}

        {error && <p className="text-red-600 text-sm mt-4">Error: {error}</p>}
        {success && <p className="text-green-600 text-sm mt-4">{success}</p>}

        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-colors duration-200"
          disabled={loading || !selectedWorkCenter}
        >
          {loading ? 'Creating...' : 'Create Maintenance Request'}
        </button>
      </form>
    </div>
  );
};

export default CreateMaintenance;

