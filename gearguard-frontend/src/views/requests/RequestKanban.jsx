import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMaintenanceRequests } from '../../services/api'
import Layout from '../../components/Layout'

const STAGES = [
  { id: 'new', name: 'New', color: 'from-gray-400 to-gray-500', icon: '🆕' },
  { id: 'in_progress', name: 'In Progress', color: 'from-blue-400 to-blue-500', icon: '⚙️' },
  { id: 'repaired', name: 'Repaired', color: 'from-green-400 to-green-500', icon: '✅' },
  { id: 'scrap', name: 'Scrap', color: 'from-red-400 to-red-500', icon: '❌' },
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
      if (Array.isArray(data)) {
        setRequests(data)
      } else {
        setRequests([])
      }
    } catch (err) {
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700',
    }
    return colors[priority] || 'bg-gray-100 text-gray-700'
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Maintenance Requests - Kanban</h1>
            <p className="text-gray-600">Read-only view. Status updates are handled through work logs.</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'user') && (
            <Link
              to="/requests/new"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
            >
              <span>➕</span>
              <span>New Request</span>
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Read-only Kanban - no drag functionality */}
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {STAGES.map((stage) => {
            const stageRequests = getRequestsByStage(stage.id)
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80"
              >
                <div className={`bg-gradient-to-br ${stage.color} rounded-t-2xl p-4 shadow-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{stage.icon}</span>
                      <h2 className="font-bold text-white text-lg">
                        {stage.name}
                      </h2>
                    </div>
                    <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm font-bold text-white">
                      {stageRequests.length}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-b-2xl p-4 min-h-[500px] space-y-3 border-2 border-t-0 border-gray-200">
                  {stageRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-sm">No requests</p>
                    </div>
                  ) : (
                    stageRequests.map((request) => (
                      <div
                        key={request.id}
                        onClick={() => navigate(`/requests/${request.id}`)}
                        className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 cursor-pointer border-2 ${
                          isOverdue(request) ? 'border-red-300 border-l-4' : 'border-gray-100'
                        } transform hover:-translate-y-1`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-2">
                            {request.title || 'No Title'}
                          </h3>
                          {isOverdue(request) && (
                            <span className="flex-shrink-0 ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold">
                              Overdue
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {request.equipment_name && (
                            <div className="flex items-center text-xs text-gray-600">
                              <span className="mr-2">⚙️</span>
                              <span className="truncate">{request.equipment_name}</span>
                            </div>
                          )}
                          {request.technician_email && (
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                                {request.technician_email?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs text-gray-600 truncate">
                                {request.technician_email}
                              </span>
                            </div>
                          )}
                          {request.priority && (
                            <div className="flex items-center">
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getPriorityColor(request.priority)}`}>
                                {request.priority}
                              </span>
                            </div>
                          )}
                          {request.scheduled_start && (
                            <div className="flex items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                              <span className="mr-2">📅</span>
                              <span>{new Date(request.scheduled_start).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
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

