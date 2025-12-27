import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMaintenanceTeams, deleteMaintenanceTeam } from '../../services/api'
import Layout from '../../components/Layout'

function TeamList() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const data = await getMaintenanceTeams()
      setTeams(data)
    } catch (err) {
      setError(err.message || 'Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return
    }
    try {
      await deleteMaintenanceTeam(id)
      setTeams(teams.filter(team => team.id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete team')
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Maintenance Teams</h1>
            <p className="text-gray-600">Manage maintenance teams and their members</p>
          </div>
          {isAdmin && (
            <Link
              to="/teams/new"
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Add Team</span>
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {teams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👥</span>
            </div>
            <p className="text-gray-500 text-lg">No teams found.</p>
            {isAdmin && (
              <Link
                to="/teams/new"
                className="mt-4 inline-block text-green-600 hover:text-green-700 font-medium"
              >
                Create your first team →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <span className="mr-1">🏢</span>
                      {team.company_name}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <Link
                        to={`/teams/${team.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(team.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="mr-2">👥</span>
                    Members ({team.members?.length || 0})
                  </p>
                  {team.members && team.members.length > 0 ? (
                    <div className="space-y-2">
                      {team.members.slice(0, 3).map((member, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                            {member.email?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{member.email}</p>
                            <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                          </div>
                        </div>
                      ))}
                      {team.members.length > 3 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          +{team.members.length - 3} more members
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No members assigned</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default TeamList
