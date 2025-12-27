import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './views/auth/Login'
import Signup from './views/auth/Signup'
import ForgotPassword from './views/auth/ForgotPassword'
import Dashboard from './views/Dashboard'
import EquipmentList from './views/equipment/EquipmentList'
import EquipmentForm from './views/equipment/EquipmentForm'
import EquipmentDetail from './views/equipment/EquipmentDetail'
import TeamList from './views/teams/TeamList'
import TeamForm from './views/teams/TeamForm'
import RequestKanban from './views/requests/RequestKanban'
import RequestCalendar from './views/requests/RequestCalendar'
import RequestList from './views/requests/RequestList'
import RequestForm from './views/requests/RequestForm'
import RequestDetail from './views/requests/RequestDetail'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Equipment Routes */}
              <Route
                path="/equipment"
                element={
                  <ProtectedRoute>
                    <EquipmentList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/equipment/new"
                element={
                  <ProtectedRoute>
                    <EquipmentForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/equipment/:id"
                element={
                  <ProtectedRoute>
                    <EquipmentDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/equipment/:id/edit"
                element={
                  <ProtectedRoute>
                    <EquipmentForm />
                  </ProtectedRoute>
                }
              />

              {/* Maintenance Team Routes */}
              <Route
                path="/teams"
                element={
                  <ProtectedRoute>
                    <TeamList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams/new"
                element={
                  <ProtectedRoute>
                    <TeamForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams/:id/edit"
                element={
                  <ProtectedRoute>
                    <TeamForm />
                  </ProtectedRoute>
                }
              />

              {/* Maintenance Request Routes */}
              <Route
                path="/requests"
                element={
                  <ProtectedRoute>
                    <RequestKanban />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests/kanban"
                element={
                  <ProtectedRoute>
                    <RequestKanban />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests/calendar"
                element={
                  <ProtectedRoute>
                    <RequestCalendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests/list"
                element={
                  <ProtectedRoute>
                    <RequestList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests/new"
                element={
                  <ProtectedRoute>
                    <RequestForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests/:id"
                element={
                  <ProtectedRoute>
                    <RequestDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests/:id/edit"
                element={
                  <ProtectedRoute>
                    <RequestForm />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
