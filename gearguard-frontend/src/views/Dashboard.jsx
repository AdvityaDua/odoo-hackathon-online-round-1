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

  const statCards = [
    {
      title: 'Equipment',
      value: stats.equipment,
      icon: '⚙️',
      color: 'from-blue-500 to-blue-600',
      link: '/equipment',
    },
    {
      title: 'Maintenance Teams',
      value: stats.teams,
      icon: '👥',
      color: 'from-green-500 to-green-600',
      link: '/teams',
    },
    {
      title: 'Maintenance Requests',
      value: stats.requests,
      icon: '🔧',
      color: 'from-yellow-500 to-orange-500',
      link: '/requests',
    },
  ]

  const quickActions = [
    {
      title: 'Add Equipment',
      description: 'Register new equipment',
      link: '/equipment/new',
      icon: '➕',
      color: 'blue',
      adminOnly: true,
    },
    {
      title: 'Create Team',
      description: 'Set up maintenance team',
      link: '/teams/new',
      icon: '👥',
      color: 'green',
      adminOnly: true,
    },
    {
      title: 'New Request',
      description: 'Create maintenance request',
      link: '/requests/new',
      icon: '🔧',
      color: 'purple',
      adminOnly: false,
    },
  ]

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here's what's happening with your maintenance operations today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {statCards.map((stat) => (
            <Link
              key={stat.title}
              to={stat.link}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))`, '--tw-gradient-from': stat.color.split(' ')[1], '--tw-gradient-to': stat.color.split(' ')[3] }}></div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-3xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        {user?.role === 'admin' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions
                .filter((action) => !action.adminOnly || user?.role === 'admin')
                .map((action) => (
                  <Link
                    key={action.title}
                    to={action.link}
                    className="group bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br from-${action.color}-500 to-${action.color}-600 rounded-lg flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* Maintenance Requests Quick Access */}
        {(user?.role === 'admin' || user?.role === 'user') && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Maintenance Requests</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/requests/new"
                className="group bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-white transform hover:-translate-y-1"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    🔧
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">New Request</h3>
                    <p className="text-sm text-purple-100 mt-1">Create maintenance request</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Dashboard
