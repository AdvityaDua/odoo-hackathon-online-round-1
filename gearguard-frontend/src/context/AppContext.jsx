import { createContext, useContext, useState } from 'react'

const AppContext = createContext(undefined)

export function AppProvider({ children }) {
  const [state, setState] = useState({
    equipment: [],
    maintenanceTeams: [],
    maintenanceRequests: [],
  })

  // Equipment actions
  const addEquipment = (equipment) => {
    setState((prev) => ({
      ...prev,
      equipment: [...prev.equipment, equipment],
    }))
  }

  const updateEquipment = (id, equipment) => {
    setState((prev) => ({
      ...prev,
      equipment: prev.equipment.map((eq) =>
        eq.id === id ? { ...eq, ...equipment } : eq
      ),
    }))
  }

  const deleteEquipment = (id) => {
    setState((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((eq) => eq.id !== id),
    }))
  }

  // Maintenance Team actions
  const addMaintenanceTeam = (team) => {
    setState((prev) => ({
      ...prev,
      maintenanceTeams: [...prev.maintenanceTeams, team],
    }))
  }

  const updateMaintenanceTeam = (id, team) => {
    setState((prev) => ({
      ...prev,
      maintenanceTeams: prev.maintenanceTeams.map((t) =>
        t.id === id ? { ...t, ...team } : t
      ),
    }))
  }

  const deleteMaintenanceTeam = (id) => {
    setState((prev) => ({
      ...prev,
      maintenanceTeams: prev.maintenanceTeams.filter((t) => t.id !== id),
    }))
  }

  // Maintenance Request actions
  const addMaintenanceRequest = (request) => {
    setState((prev) => ({
      ...prev,
      maintenanceRequests: [...prev.maintenanceRequests, request],
    }))
  }

  const updateMaintenanceRequest = (id, request) => {
    setState((prev) => ({
      ...prev,
      maintenanceRequests: prev.maintenanceRequests.map((r) =>
        r.id === id ? { ...r, ...request } : r
      ),
    }))
  }

  const deleteMaintenanceRequest = (id) => {
    setState((prev) => ({
      ...prev,
      maintenanceRequests: prev.maintenanceRequests.filter((r) => r.id !== id),
    }))
  }

  const value = {
    state,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    addMaintenanceTeam,
    updateMaintenanceTeam,
    deleteMaintenanceTeam,
    addMaintenanceRequest,
    updateMaintenanceRequest,
    deleteMaintenanceRequest,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}



