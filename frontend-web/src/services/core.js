import STATIC_DATA from '../utils/staticData';

const coreService = {
  fetchCompaniesSelect: async () => {
    return STATIC_DATA.companies;
  },

  fetchDepartmentsSelect: async () => {
    return STATIC_DATA.departments;
  },

  fetchEquipmentSelect: async () => {
    return STATIC_DATA.equipment.map(eq => ({
      id: eq.id,
      name: eq.name,
      serial_number: eq.serial_number,
      company: eq.company,
      category: eq.category,
    }));
  },

  fetchWorkCentersSelect: async () => {
    return STATIC_DATA.work_centers.map(wc => ({
      id: wc.id,
      name: wc.name,
      code: wc.code,
      company_id: wc.company,
      company_name: STATIC_DATA.companies.find(c => c.id === wc.company)?.name || 'N/A',
      company_location: STATIC_DATA.companies.find(c => c.id === wc.company)?.location || 'N/A',
    }));
  },

  fetchEquipmentCategories: async () => {
    return STATIC_DATA.equipment_categories;
  },

  fetchUsersSelect: async () => {
    return STATIC_DATA.users.map(user => ({
      id: user.id,
      email: user.email,
    }));
  },

  // Maintenance Module APIs
  getMaintenanceList: async () => {
    return STATIC_DATA.maintenance_requests.map(req => ({
      ...req,
      equipment_name: STATIC_DATA.equipment.find(eq => eq.id === req.equipment)?.name || 'N/A',
      work_center_name: STATIC_DATA.work_centers.find(wc => wc.id === req.work_center)?.name || 'N/A',
      assigned_technician_email: STATIC_DATA.users.find(u => u.id === req.assigned_technician)?.email || 'N/A',
      assigned_team_name: STATIC_DATA.maintenance_teams.find(t => t.id === req.assigned_team)?.name || 'N/A',
    }));
  },

  getMaintenanceDetail: async (id) => {
    const maintenance = STATIC_DATA.maintenance_requests.find(req => req.id === parseInt(id));
    if (!maintenance) {
      throw new Error("Maintenance request not found");
    }
    return {
      ...maintenance,
      equipment_name: STATIC_DATA.equipment.find(eq => eq.id === maintenance.equipment)?.name || 'N/A',
      work_center_name: STATIC_DATA.work_centers.find(wc => wc.id === maintenance.work_center)?.name || 'N/A',
      assigned_technician_email: STATIC_DATA.users.find(u => u.id === maintenance.assigned_technician)?.email || 'N/A',
      assigned_team_name: STATIC_DATA.maintenance_teams.find(t => t.id === maintenance.assigned_team)?.name || 'N/A',
    };
  },

  getWorkLogs: async (maintenanceId) => {
    return STATIC_DATA.work_logs
      .filter(log => log.maintenance_id === parseInt(maintenanceId))
      .map(log => ({
        ...log,
        technician_email: STATIC_DATA.users.find(u => u.id === log.technician)?.email || 'N/A',
      }));
  },

  // These will just be no-ops for static data
  postMaintenanceAvailability: async (payload) => {
    console.warn("Availability check is a no-op with static data.", payload);
    // Return a mock response
    return {
      available_work_centers: STATIC_DATA.work_centers.filter(wc => wc.company === payload.company),
      assigned_technician: STATIC_DATA.users.find(u => u.roles.includes('technician') && u.company === payload.company) || null,
    };
  },
  postMaintenanceRequest: async (payload) => {
    console.warn("Create maintenance request is a no-op with static data.", payload);
    return { message: "Maintenance request created (static data only)" };
  },
  postWorkLog: async (payload) => {
    console.warn("Post work log is a no-op with static data.", payload);
    return { message: "Work log added (static data only)" };
  },
  postReassign: async (payload) => {
    console.warn("Reassign is a no-op with static data.", payload);
    return { message: "Maintenance reassigned (static data only)" };
  },
};

export default coreService;
