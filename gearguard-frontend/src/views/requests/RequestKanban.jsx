import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMaintenanceRequests } from '../../services/api'
import Layout from '../../components/Layout'

const STAGES = [
  { id: 'new', name: 'New', color: 'bg-gray-200' },
  { id: 'in_progress', name: 'In Progress', color: 'bg-blue-200' },
  { id: 'repaired', name: 'Repaired', color: 'bg-green-200' },
  { id: 'scrap', name: 'Scrap', color: 'bg-red-200' },
]


function RequestKanban() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await getMaintenanceRequests()
      // Handle case where API might not exist or returns non-array
      if (Array.isArray(data)) {
        setRequests(data)
      } else {
        setRequests([])
      }
    } catch (err) {
      // Gracefully handle API not available
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setRequests([])
        setError('Maintenance requests feature is not available yet.')
      } else {
        setError(err.message || 'Failed to load requests')
      }
    } finally {
      setLoading(false)
    }
  }

  const getRequestsByStage = (stageId) => {
    // Map new status values to old stage names for display
    const statusMap = {
      'new': 'new',
      'scheduled': 'new',
      'in_progress': 'in_progress',
      'blocked': 'in_progress',
      'completed': 'repaired',
      'cancelled': 'scrap',
    }
    return requests.filter(req => {
      const mappedStage = statusMap[req.status] || 'new'
      return mappedStage === stageId
    })
  }

  const isOverdue = (request) => {
    if (!request.scheduled_start) return false
    const scheduled = new Date(request.scheduled_start)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return scheduled < today && request.status !== 'completed' && request.status !== 'cancelled'
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests - Kanban</h1>
            <p className="mt-2 text-sm text-gray-500">
              Read-only view. Status updates are handled through work logs.
            </p>
          </div>
          {(user?.role === 'admin' || user?.role === 'user') && (
            <Link
              to="/requests/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              New Request
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Read-only Kanban - no drag functionality */}
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageRequests = getRequestsByStage(stage.id)
            return (
              <div
                key={stage.id}
                className={`flex-shrink-0 w-80 ${stage.color} rounded-lg p-4`}
              >
                <h2 className="font-semibold text-gray-900 mb-4">
                  {stage.name} ({stageRequests.length})
                </h2>
                <div className="space-y-3 min-h-[200px]">
                  {stageRequests.map((request) => (
                    <div
                      key={request.id}
                      onClick={() => navigate(`/requests/${request.id}`)}
                      className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow mb-3 ${
                        isOverdue(request) ? 'border-l-4 border-red-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {request.title || 'No Title'}
                        </h3>
                        {isOverdue(request) && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Overdue
                          </span>
                        )}
                      </div>
                      {request.equipment_name && (
                        <p className="text-xs text-gray-600 mb-1">
                          Equipment: {request.equipment_name}
                        </p>
                      )}
                      {request.technician_email && (
                        <div className="flex items-center mt-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                            {request.technician_email?.charAt(0).toUpperCase()}
                          </div>
                          <span className="ml-2 text-xs text-gray-600">
                            {request.technician_email}
                          </span>
                        </div>
                      )}
                      {request.scheduled_start && (
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(request.scheduled_start).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

export default RequestKanban
