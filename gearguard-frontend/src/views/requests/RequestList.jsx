import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMaintenanceRequests } from '../../services/api'
import Layout from '../../components/Layout'

function RequestList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const equipmentFilter = searchParams.get('equipment')
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({
    type: '',
    stage: '',
    equipment: equipmentFilter || '',
  })

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

  const filteredRequests = requests.filter(req => {
    if (filter.type && req.maintenance_type !== filter.type) return false
    if (filter.stage && req.status !== filter.stage) return false
    if (filter.equipment && req.equipment !== parseInt(filter.equipment)) return false
    return true
  })

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-gray-100 text-gray-800 border-gray-300',
      scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      blocked: 'bg-orange-100 text-orange-800 border-orange-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getTypeColor = (type) => {
    return type === 'preventive' 
      ? 'bg-purple-100 text-purple-800 border-purple-300' 
      : 'bg-orange-100 text-orange-800 border-orange-300'
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Maintenance Requests</h1>
            <p className="text-gray-600">View and manage all maintenance requests</p>
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

        {/* Filters */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Types</option>
                <option value="corrective">Corrective</option>
                <option value="preventive">Preventive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filter.stage}
                onChange={(e) => setFilter({ ...filter, stage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment ID</label>
              <input
                type="text"
                placeholder="Filter by equipment ID"
                value={filter.equipment}
                onChange={(e) => setFilter({ ...filter, equipment: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔧</span>
              </div>
              <p className="text-gray-500 text-lg">No requests found.</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                onClick={() => navigate(`/requests/${request.id}`)}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-100 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {request.title || 'No Title'}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getTypeColor(request.maintenance_type)}`}>
                        {request.maintenance_type}
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      {request.priority && (
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      {request.equipment_name && (
                        <div className="flex items-center">
                          <span className="mr-2">⚙️</span>
                          <span>{request.equipment_name}</span>
                        </div>
                      )}
                      {request.scheduled_start && (
                        <div className="flex items-center">
                          <span className="mr-2">📅</span>
                          <span>{new Date(request.scheduled_start).toLocaleDateString()}</span>
                        </div>
                      )}
                      {request.technician_email && (
                        <div className="flex items-center">
                          <span className="mr-2">👤</span>
                          <span>{request.technician_email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 text-gray-400 group-hover:text-blue-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

export default RequestList
