import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import coreService from '../services/core';

const WorkCenters = () => {
  const { isAdmin } = useAuth();
  const [workCenters, setWorkCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentWorkCenter, setCurrentWorkCenter] = useState(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [costPerHour, setCostPerHour] = useState('');
  const [capacity, setCapacity] = useState('');
  const [timeEfficiency, setTimeEfficiency] = useState('');
  const [oeeTarget, setOeeTarget] = useState('');

  const [companiesSelect, setCompaniesSelect] = useState([]);

  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchWorkCenters();
    fetchSelectData();
  }, []);

  const fetchSelectData = async () => {
    try {
      const companiesRes = await coreService.fetchCompaniesSelect();
      setCompaniesSelect(companiesRes);
    } catch (err) {
      console.error("Error fetching select data:", err.response?.data || err.message);
    }
  };

  const fetchWorkCenters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coreService.fetchWorkCentersSelect(); // Using the select API to get mapped data
      setWorkCenters(data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view work centers.');
      } else {
        setError('Failed to fetch work centers.');
      }
      console.error("Error fetching work centers:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCode('');
    setCompanyId('');
    setCostPerHour('');
    setCapacity('');
    setTimeEfficiency('');
    setOeeTarget('');
    setFormError(null);
    setFormLoading(false);
  };

  const handleAddWorkCenter = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await api.post('/api/core/work-centers/', {
        name,
        code,
        company: companyId,
        cost_per_hour: parseFloat(costPerHour),
        capacity: parseInt(capacity),
        time_efficiency: parseFloat(timeEfficiency),
        oee_target: parseFloat(oeeTarget),
      });
      setShowAddForm(false);
      resetForm();
      fetchWorkCenters();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to add work center.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditWorkCenter = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await api.put(`/api/core/work-centers/${currentWorkCenter.id}/`, {
        name,
        code,
        company: companyId,
        cost_per_hour: parseFloat(costPerHour),
        capacity: parseInt(capacity),
        time_efficiency: parseFloat(timeEfficiency),
        oee_target: parseFloat(oeeTarget),
      });
      setShowEditForm(false);
      setCurrentWorkCenter(null);
      resetForm();
      fetchWorkCenters();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to update work center.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteWorkCenter = async (id) => {
    if (window.confirm('Are you sure you want to delete this work center?')) {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/api/core/work-centers/${id}/`);
        fetchWorkCenters();
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You do not have permission to delete work centers.');
        } else {
          setError('Failed to delete work center.');
        }
        console.error("Error deleting work center:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditForm = (workCenter) => {
    setCurrentWorkCenter(workCenter);
    setName(workCenter.name);
    setCode(workCenter.code);
    setCompanyId(workCenter.company_id || ''); // Use company_id from mapped data
    setCostPerHour(workCenter.cost_per_hour);
    setCapacity(workCenter.capacity);
    setTimeEfficiency(workCenter.time_efficiency);
    setOeeTarget(workCenter.oee_target);
    setShowEditForm(true);
  };

  const getCompanyName = (id) => companiesSelect.find(c => c.id === id)?.name || 'N/A';

  if (loading) {
    return <div className="text-center py-8">Loading work centers...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Work Centers</h2>
      <p className="text-gray-600 mb-6">Organize and manage your work centers.</p>

      {isAdmin && (
        <button
          onClick={() => {
            setShowAddForm(true);
            resetForm();
          }}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-colors duration-200"
        >
          Add Work Center
        </button>
      )}

      {showAddForm && isAdmin && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Add New Work Center</h3>
          <form onSubmit={handleAddWorkCenter} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">Code</label>
              <input
                type="text"
                id="code"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">Company</label>
              <select
                id="companyId"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                required
              >
                <option value="">Select Company</option>
                {companiesSelect.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="costPerHour" className="block text-sm font-medium text-gray-700">Cost per Hour</label>
              <input
                type="number"
                id="costPerHour"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={costPerHour}
                onChange={(e) => setCostPerHour(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                id="capacity"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="timeEfficiency" className="block text-sm font-medium text-gray-700">Time Efficiency</label>
              <input
                type="number"
                id="timeEfficiency"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={timeEfficiency}
                onChange={(e) => setTimeEfficiency(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="oeeTarget" className="block text-sm font-medium text-gray-700">OEE Target</label>
              <input
                type="number"
                id="oeeTarget"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={oeeTarget}
                onChange={(e) => setOeeTarget(e.target.value)}
                required
              />
            </div>
            {formError && <p className="text-red-600 text-sm">{formError}</p>}
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition-colors duration-200"
                disabled={formLoading}
              >
                {formLoading ? 'Adding...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditForm && isAdmin && currentWorkCenter && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Edit Work Center</h3>
          <form onSubmit={handleEditWorkCenter} className="space-y-4">
            <div>
              <label htmlFor="editName" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="editName"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="editCode" className="block text-sm font-medium text-gray-700">Code</label>
              <input
                type="text"
                id="editCode"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="editCompanyId" className="block text-sm font-medium text-gray-700">Company</label>
              <select
                id="editCompanyId"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                required
              >
                <option value="">Select Company</option>
                {companiesSelect.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="editCostPerHour" className="block text-sm font-medium text-gray-700">Cost per Hour</label>
              <input
                type="number"
                id="editCostPerHour"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={costPerHour}
                onChange={(e) => setCostPerHour(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="editCapacity" className="block text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                id="editCapacity"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="editTimeEfficiency" className="block text-sm font-medium text-gray-700">Time Efficiency</label>
              <input
                type="number"
                id="editTimeEfficiency"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={timeEfficiency}
                onChange={(e) => setTimeEfficiency(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="editOeeTarget" className="block text-sm font-medium text-gray-700">OEE Target</label>
              <input
                type="number"
                id="editOeeTarget"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={oeeTarget}
                onChange={(e) => setOeeTarget(e.target.value)}
                required
              />
            </div>
            {formError && <p className="text-red-600 text-sm">{formError}</p>}
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition-colors duration-200"
                disabled={formLoading}
              >
                {formLoading ? 'Updating...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setCurrentWorkCenter(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {workCenters.length === 0 ? (
        <p className="text-gray-600">No work centers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Per Hour</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Efficiency</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OEE Target</th>
                {isAdmin && <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workCenters.map((workCenter) => (
                <tr key={workCenter.id}>
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{workCenter.id}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{workCenter.name}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{workCenter.code}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{workCenter.company_name}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{workCenter.cost_per_hour}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{workCenter.capacity}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{workCenter.time_efficiency}%</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{workCenter.oee_target}%</td>
                  {isAdmin && (
                    <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditForm(workCenter)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWorkCenter(workCenter.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkCenters;
