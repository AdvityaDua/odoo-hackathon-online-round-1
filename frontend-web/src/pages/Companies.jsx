import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const Companies = () => {
  const { isAdmin } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/core/companies/');
      setCompanies(response.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view companies.');
      } else {
        setError('Failed to fetch companies.');
      }
      console.error("Error fetching companies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await api.post('/api/core/companies/', { name: companyName, location: companyLocation });
      setShowAddForm(false);
      setCompanyName('');
      setCompanyLocation('');
      fetchCompanies();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to add company.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCompany = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await api.put(`/api/core/companies/${currentCompany.id}/`, { name: companyName, location: companyLocation });
      setShowEditForm(false);
      setCurrentCompany(null);
      setCompanyName('');
      setCompanyLocation('');
      fetchCompanies();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to update company.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/api/core/companies/${id}/`);
        fetchCompanies();
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You do not have permission to delete companies.');
        } else {
          setError('Failed to delete company.');
        }
        console.error("Error deleting company:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditForm = (company) => {
    setCurrentCompany(company);
    setCompanyName(company.name);
    setCompanyLocation(company.location);
    setShowEditForm(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading companies...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Companies</h2>
      <p className="text-gray-600 mb-6">Manage your registered companies here.</p>

      {isAdmin && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-colors duration-200"
        >
          Add Company
        </button>
      )}

      {showAddForm && isAdmin && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Add New Company</h3>
          <form onSubmit={handleAddCompany} className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                id="companyName"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="companyLocation" className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                id="companyLocation"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
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
                  setCompanyName('');
                  setCompanyLocation('');
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

      {showEditForm && isAdmin && currentCompany && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Edit Company</h3>
          <form onSubmit={handleEditCompany} className="space-y-4">
            <div>
              <label htmlFor="editCompanyName" className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                id="editCompanyName"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="editCompanyLocation" className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                id="editCompanyLocation"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
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
                  setCurrentCompany(null);
                  setCompanyName('');
                  setCompanyLocation('');
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

      {companies.length === 0 ? (
        <p className="text-gray-600">No companies found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                {isAdmin && <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id}>
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{company.id}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{company.name}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{company.location}</td>
                  {isAdmin && (
                    <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditForm(company)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company.id)}
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

export default Companies;