import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const Departments = () => {
  const { isAdmin } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [departmentName, setDepartmentName] = useState('');
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/core/departments/');
      setDepartments(response.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view departments.');
      } else {
        setError('Failed to fetch departments.');
      }
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await api.post('/api/core/departments/', { name: departmentName });
      setShowAddForm(false);
      setDepartmentName('');
      fetchDepartments();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to add department.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditDepartment = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await api.put(`/api/core/departments/${currentDepartment.id}/`, { name: departmentName });
      setShowEditForm(false);
      setCurrentDepartment(null);
      setDepartmentName('');
      fetchDepartments();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to update department.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/api/core/departments/${id}/`);
        fetchDepartments();
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You do not have permission to delete departments.');
        } else {
          setError('Failed to delete department.');
        }
        console.error("Error deleting department:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditForm = (department) => {
    setCurrentDepartment(department);
    setDepartmentName(department.name);
    setShowEditForm(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading departments...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Departments</h2>
      <p className="text-gray-600 mb-6">View and manage departments across your organization.</p>

      {isAdmin && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-colors duration-200"
        >
          Add Department
        </button>
      )}

      {showAddForm && isAdmin && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Add New Department</h3>
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div>
              <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700">Department Name</label>
              <input
                type="text"
                id="departmentName"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
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
                  setDepartmentName('');
                  setFormError(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditForm && isAdmin && currentDepartment && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Edit Department</h3>
          <form onSubmit={handleEditDepartment} className="space-y-4">
            <div>
              <label htmlFor="editDepartmentName" className="block text-sm font-medium text-gray-700">Department Name</label>
              <input
                type="text"
                id="editDepartmentName"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
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
                  setCurrentDepartment(null);
                  setDepartmentName('');
                  setFormError(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {departments.length === 0 ? (
        <p className="text-gray-600">No departments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                {isAdmin && <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map((department) => (
                <tr key={department.id}>
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{department.id}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{department.name}</td>
                  {isAdmin && (
                    <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditForm(department)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(department.id)}
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

export default Departments;
