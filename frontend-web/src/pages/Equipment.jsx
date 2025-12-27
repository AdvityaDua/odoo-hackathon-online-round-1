import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import coreService from '../services/core';

const Equipment = () => {
  const { isAdmin, isTechnician } = useAuth();
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);

  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const [companiesSelect, setCompaniesSelect] = useState([]);
  const [departmentsSelect, setDepartmentsSelect] = useState([]);
  const [categoriesSelect, setCategoriesSelect] = useState([]);
  const [usersSelect, setUsersSelect] = useState([]);

  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchEquipment();
    fetchSelectData();
  }, []);

  const fetchSelectData = async () => {
    try {
      const [companiesRes, departmentsRes, categoriesRes, usersRes] = await Promise.all([
        coreService.fetchCompaniesSelect(),
        coreService.fetchDepartmentsSelect(),
        coreService.fetchEquipmentCategories(), // Now directly from coreService
        coreService.fetchUsersSelect(),
      ]);
      setCompaniesSelect(companiesRes);
      setDepartmentsSelect(departmentsRes);
      setCategoriesSelect(categoriesRes); // No .data anymore
      setUsersSelect(usersRes);
    } catch (err) {
      console.error("Error fetching select data:", err.response?.data || err.message);
    }
  };

  const fetchEquipment = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coreService.fetchEquipmentSelect(); // Using the select API to get mapped data
      setEquipmentList(data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view equipment.');
      } else {
        setError('Failed to fetch equipment.');
      }
      console.error("Error fetching equipment:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSerialNumber('');
    setCompanyId('');
    setCategoryId('');
    setAssignedEmployee('');
    setDepartmentId('');
    setFormError(null);
    setFormLoading(false);
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await api.post('/api/core/equipment/', {
        name,
        serial_number: serialNumber,
        company: companyId,
        category: categoryId,
        employee: assignedEmployee || null,
        department: departmentId,
      });
      setShowAddForm(false);
      resetForm();
      fetchEquipment();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to add equipment.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditEquipment = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      await api.put(`/api/core/equipment/${currentEquipment.id}/`, {
        name,
        serial_number: serialNumber,
        company: companyId,
        category: categoryId,
        employee: assignedEmployee || null,
        department: departmentId,
      });
      setShowEditForm(false);
      setCurrentEquipment(null);
      resetForm();
      fetchEquipment();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to update equipment.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/api/core/equipment/${id}/`);
        fetchEquipment();
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You do not have permission to delete equipment.');
        } else {
          setError('Failed to delete equipment.');
        }
        console.error("Error deleting equipment:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditForm = (equipment) => {
    setCurrentEquipment(equipment);
    setName(equipment.name);
    setSerialNumber(equipment.serial_number);
    setCompanyId(equipment.company || '');
    setCategoryId(equipment.category || '');
    setAssignedEmployee(equipment.employee || '');
    setDepartmentId(equipment.department || '');
    setShowEditForm(true);
  };

  const getCompanyName = (id) => companiesSelect.find(c => c.id === id)?.name || 'N/A';
  const getCategoryName = (id) => categoriesSelect.find(c => c.id === id)?.name || 'N/A';
  const getEmployeeEmail = (id) => usersSelect.find(u => u.id === id)?.email || 'N/A';
  const getDepartmentName = (id) => departmentsSelect.find(d => d.id === id)?.name || 'N/A';

  if (loading) {
    return <div className="text-center py-8">Loading equipment...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Equipment</h2>
      <p className="text-gray-600 mb-6">Manage all equipment registered in the system.</p>

      {isAdmin && (
        <button
          onClick={() => {
            setShowAddForm(true);
            resetForm();
          }}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-colors duration-200"
        >
          Add Equipment
        </button>
      )}

      {showAddForm && isAdmin && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Add New Equipment</h3>
          <form onSubmit={handleAddEquipment} className="space-y-4">
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
              <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">Serial Number</label>
              <input
                type="text"
                id="serialNumber"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
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
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="categoryId"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categoriesSelect.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="assignedEmployee" className="block text-sm font-medium text-gray-700">Assigned Employee ID (optional)</label>
              <select
                id="assignedEmployee"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
              >
                <option value="">Select Employee</option>
                {usersSelect.map(user => (
                  <option key={user.id} value={user.id}>{user.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">Department</label>
              <select
                id="departmentId"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departmentsSelect.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
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

      {showEditForm && isAdmin && currentEquipment && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Edit Equipment</h3>
          <form onSubmit={handleEditEquipment} className="space-y-4">
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
              <label htmlFor="editSerialNumber" className="block text-sm font-medium text-gray-700">Serial Number</label>
              <input
                type="text"
                id="editSerialNumber"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
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
              <label htmlFor="editCategoryId" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="editCategoryId"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categoriesSelect.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="editAssignedEmployee" className="block text-sm font-medium text-gray-700">Assigned Employee ID (optional)</label>
              <select
                id="editAssignedEmployee"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={assignedEmployee}
                onChange={(e) => setAssignedEmployee(e.target.value)}
              >
                <option value="">Select Employee</option>
                {usersSelect.map(user => (
                  <option key={user.id} value={user.id}>{user.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="editDepartmentId" className="block text-sm font-medium text-gray-700">Department</label>
              <select
                id="editDepartmentId"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departmentsSelect.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
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
                  setCurrentEquipment(null);
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

      {equipmentList.length === 0 ? (
        <p className="text-gray-600">No equipment found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Employee</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                {isAdmin && <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipmentList.map((equipment) => (
                <tr key={equipment.id}>
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{equipment.id}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{equipment.name}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{equipment.serial_number}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{getCompanyName(equipment.company)}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{getCategoryName(equipment.category)}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{getEmployeeEmail(equipment.employee)}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{getDepartmentName(equipment.department)}</td>
                  {isAdmin && (
                    <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditForm(equipment)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEquipment(equipment.id)}
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

export default Equipment;
