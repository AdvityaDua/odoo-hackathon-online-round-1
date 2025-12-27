import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const EquipmentCategories = () => {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [defaultTechnician, setDefaultTechnician] = useState('');
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchEquipmentCategories();
  }, []);

  const fetchEquipmentCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/core/equipment-categories/');
      setCategories(response.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view equipment categories.');
      } else {
        setError('Failed to fetch equipment categories.');
      }
      console.error("Error fetching equipment categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await api.post('/api/core/equipment-categories/', {
        name: categoryName,
        default_technician: defaultTechnician || null,
      });
      setShowAddForm(false);
      setCategoryName('');
      setDefaultTechnician('');
      fetchEquipmentCategories();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to add equipment category.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await api.put(`/api/core/equipment-categories/${currentCategory.id}/`, {
        name: categoryName,
        default_technician: defaultTechnician || null,
      });
      setShowEditForm(false);
      setCurrentCategory(null);
      setCategoryName('');
      setDefaultTechnician('');
      fetchEquipmentCategories();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to update equipment category.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment category?')) {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/api/core/equipment-categories/${id}/`);
        fetchEquipmentCategories();
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You do not have permission to delete equipment categories.');
        } else {
          setError('Failed to delete equipment category.');
        }
        console.error("Error deleting equipment category:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditForm = (category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setDefaultTechnician(category.default_technician || '');
    setShowEditForm(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading equipment categories...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Equipment Categories</h2>
      <p className="text-gray-600 mb-6">Manage and view equipment categories.</p>

      {isAdmin && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-colors duration-200"
        >
          Add Category
        </button>
      )}

      {showAddForm && isAdmin && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Add New Equipment Category</h3>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Category Name</label>
              <input
                type="text"
                id="categoryName"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="defaultTechnician" className="block text-sm font-medium text-gray-700">Default Technician ID (optional)</label>
              <input
                type="number"
                id="defaultTechnician"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={defaultTechnician}
                onChange={(e) => setDefaultTechnician(e.target.value)}
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
                  setCategoryName('');
                  setDefaultTechnician('');
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

      {showEditForm && isAdmin && currentCategory && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Edit Equipment Category</h3>
          <form onSubmit={handleEditCategory} className="space-y-4">
            <div>
              <label htmlFor="editCategoryName" className="block text-sm font-medium text-gray-700">Category Name</label>
              <input
                type="text"
                id="editCategoryName"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="editDefaultTechnician" className="block text-sm font-medium text-gray-700">Default Technician ID (optional)</label>
              <input
                type="number"
                id="editDefaultTechnician"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={defaultTechnician}
                onChange={(e) => setDefaultTechnician(e.target.value)}
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
                  setCurrentCategory(null);
                  setCategoryName('');
                  setDefaultTechnician('');
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

      {categories.length === 0 ? (
        <p className="text-gray-600">No equipment categories found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Technician ID</th>
                {isAdmin && <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{category.id}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{category.name}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{category.default_technician || 'N/A'}</td>
                  {isAdmin && (
                    <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditForm(category)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
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

export default EquipmentCategories;

