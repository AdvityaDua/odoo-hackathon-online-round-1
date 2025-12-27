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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Teams</h1>
          {isAdmin && (
            <Link
              to="/teams/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Add Team
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {teams.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No teams found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <div key={team.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{team.company_name}</p>
                  </div>
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <Link
                        to={`/teams/${team.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(team.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Members:</p>
                  {team.members && team.members.length > 0 ? (
                    <ul className="text-sm text-gray-600">
                      {team.members.map((member, idx) => (
                        <li key={idx}>• {member.email} ({member.role})</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">No members</p>
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
