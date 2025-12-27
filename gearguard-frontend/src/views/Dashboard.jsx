import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getEquipment, getMaintenanceTeams } from '../services/api'
import Layout from '../components/Layout'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    equipment: 0,
    teams: 0,
    requests: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [equipment, teams] = await Promise.all([
        getEquipment(),
        getMaintenanceTeams(),
      ])
      setStats({
        equipment: equipment.length,
        teams: teams.length,
        requests: 0, // TODO: Fetch from maintenance requests API
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {user?.email}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/equipment"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-2xl">⚙️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Equipment</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.equipment}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/teams"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-2xl">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Maintenance Teams</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.teams}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/requests"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-2xl">🔧</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Maintenance Requests</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.requests}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {user?.role === 'admin' && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/equipment/new"
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
              >
                <h3 className="font-medium text-gray-900">Add Equipment</h3>
                <p className="text-sm text-gray-500 mt-1">Register new equipment</p>
              </Link>
              <Link
                to="/teams/new"
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
              >
                <h3 className="font-medium text-gray-900">Create Team</h3>
                <p className="text-sm text-gray-500 mt-1">Set up maintenance team</p>
              </Link>
            </div>
          </div>
        )}
        
        {(user?.role === 'admin' || user?.role === 'user') && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Maintenance Requests</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/requests/new"
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
              >
                <h3 className="font-medium text-gray-900">New Request</h3>
                <p className="text-sm text-gray-500 mt-1">Create maintenance request</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Dashboard
