import api from '../utils/api'

const BASE_URL = '/api/core'

// ============================================
// PUBLIC APIs (No auth required)
// ============================================

export const getCompaniesSelect = async () => {
  const response = await api.get(`${BASE_URL}/companies/select/`)
  return response.data
}

export const getDepartmentsSelect = async () => {
  const response = await api.get(`${BASE_URL}/departments/select/`)
  return response.data
}

// ============================================
// EQUIPMENT APIs
// ============================================

export const getEquipment = async () => {
  const response = await api.get(`${BASE_URL}/equipment/`)
  return response.data
}

export const getEquipmentSelect = async () => {
  const response = await api.get(`${BASE_URL}/equipment/select/`)
  return response.data
}

export const getEquipmentById = async (id) => {
  const response = await api.get(`${BASE_URL}/equipment/${id}/`)
  return response.data
}

export const createEquipment = async (data) => {
  const response = await api.post(`${BASE_URL}/equipment/`, data)
  return response.data
}

export const updateEquipment = async (id, data) => {
  const response = await api.put(`${BASE_URL}/equipment/${id}/`, data)
  return response.data
}

export const deleteEquipment = async (id) => {
  await api.delete(`${BASE_URL}/equipment/${id}/`)
  return { success: true }
}

// ============================================
// EQUIPMENT CATEGORY APIs
// ============================================

export const getEquipmentCategories = async () => {
  const response = await api.get(`${BASE_URL}/equipment-categories/`)
  return response.data
}

export const createEquipmentCategory = async (data) => {
  const response = await api.post(`${BASE_URL}/equipment-categories/`, data)
  return response.data
}

export const updateEquipmentCategory = async (id, data) => {
  const response = await api.put(`${BASE_URL}/equipment-categories/${id}/`, data)
  return response.data
}

export const deleteEquipmentCategory = async (id) => {
  await api.delete(`${BASE_URL}/equipment-categories/${id}/`)
  return { success: true }
}

// ============================================
// MAINTENANCE TEAM APIs
// ============================================

export const getMaintenanceTeams = async () => {
  const response = await api.get(`${BASE_URL}/maintenance-teams/`)
  return response.data
}

export const getMaintenanceTeamById = async (id) => {
  const response = await api.get(`${BASE_URL}/maintenance-teams/${id}/`)
  return response.data
}

export const createMaintenanceTeam = async (data) => {
  const response = await api.post(`${BASE_URL}/maintenance-teams/`, data)
  return response.data
}

export const updateMaintenanceTeam = async (id, data) => {
  const response = await api.put(`${BASE_URL}/maintenance-teams/${id}/`, data)
  return response.data
}

export const deleteMaintenanceTeam = async (id) => {
  await api.delete(`${BASE_URL}/maintenance-teams/${id}/`)
  return { success: true }
}

// ============================================
// WORK CENTER APIs
// ============================================

export const getWorkCenters = async () => {
  const response = await api.get(`${BASE_URL}/work-centers/`)
  return response.data
}

export const getWorkCentersSelect = async () => {
  const response = await api.get(`${BASE_URL}/work-centers/select/`)
  return response.data
}

export const createWorkCenter = async (data) => {
  const response = await api.post(`${BASE_URL}/work-centers/`, data)
  return response.data
}

export const updateWorkCenter = async (id, data) => {
  const response = await api.put(`${BASE_URL}/work-centers/${id}/`, data)
  return response.data
}

export const deleteWorkCenter = async (id) => {
  await api.delete(`${BASE_URL}/work-centers/${id}/`)
  return { success: true }
}

// ============================================
// DEPARTMENT APIs
// ============================================

export const getDepartments = async () => {
  const response = await api.get(`${BASE_URL}/departments/`)
  return response.data
}

export const createDepartment = async (data) => {
  const response = await api.post(`${BASE_URL}/departments/`, data)
  return response.data
}

export const updateDepartment = async (id, data) => {
  const response = await api.put(`${BASE_URL}/departments/${id}/`, data)
  return response.data
}

export const deleteDepartment = async (id) => {
  await api.delete(`${BASE_URL}/departments/${id}/`)
  return { success: true }
}

// ============================================
// COMPANY APIs
// ============================================

export const getCompanies = async () => {
  const response = await api.get(`${BASE_URL}/companies/`)
  return response.data
}

export const createCompany = async (data) => {
  const response = await api.post(`${BASE_URL}/companies/`, data)
  return response.data
}

export const updateCompany = async (id, data) => {
  const response = await api.put(`${BASE_URL}/companies/${id}/`, data)
  return response.data
}

export const deleteCompany = async (id) => {
  await api.delete(`${BASE_URL}/companies/${id}/`)
  return { success: true }
}

// ============================================
// MAINTENANCE APIs (Workflow-driven)
// ============================================

const MAINTENANCE_BASE_URL = '/api/maintenance'

// Check availability and auto-assignment
export const checkMaintenanceAvailability = async (data) => {
  const response = await api.post(`${MAINTENANCE_BASE_URL}/availability/`, data)
  return response.data
}

// Create maintenance request (after availability check)
export const createMaintenanceRequest = async (data) => {
  const response = await api.post(`${MAINTENANCE_BASE_URL}/`, data)
  return response.data
}

// List maintenance requests
export const getMaintenanceRequests = async () => {
  const response = await api.get(`${MAINTENANCE_BASE_URL}/`)
  return response.data
}

// Get maintenance request by ID
export const getMaintenanceRequestById = async (id) => {
  const response = await api.get(`${MAINTENANCE_BASE_URL}/${id}/`)
  return response.data
}

// Get work logs for a maintenance request
export const getMaintenanceWorkLogs = async (id) => {
  const response = await api.get(`${MAINTENANCE_BASE_URL}/${id}/worklogs/`)
  return response.data
}

// Add work log (technician only)
export const addWorkLog = async (data) => {
  const response = await api.post(`${MAINTENANCE_BASE_URL}/worklog/`, data)
  return response.data
}

// Request reassignment (technician only)
export const requestReassignment = async (data) => {
  const response = await api.post(`${MAINTENANCE_BASE_URL}/reassign/`, data)
  return response.data
}
