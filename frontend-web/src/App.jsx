import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Departments from './pages/Departments';
import EquipmentCategories from './pages/EquipmentCategories';
import Equipment from './pages/Equipment';
import WorkCenters from './pages/WorkCenters';
import MaintenanceList from './pages/MaintenanceList';
import MaintenanceDetail from './pages/MaintenanceDetail';
import CreateMaintenance from './pages/CreateMaintenance';
import MaintenanceKanban from './pages/MaintenanceKanban';
import MaintenanceCalendar from './pages/MaintenanceCalendar';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <AdminLayout />
          </AuthGuard>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="companies" element={<Companies />} />
        <Route path="departments" element={<Departments />} />
        <Route path="equipment-categories" element={<EquipmentCategories />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="work-centers" element={<WorkCenters />} />
        <Route path="maintenance" element={<MaintenanceList />} />
        <Route path="maintenance/:id" element={<MaintenanceDetail />} />
        <Route path="maintenance/create" element={<CreateMaintenance />} />
        <Route path="maintenance/kanban" element={<MaintenanceKanban />} />
        <Route path="maintenance/calendar" element={<MaintenanceCalendar />} />
      </Route>
    </Routes>
  );
}

export default App;
