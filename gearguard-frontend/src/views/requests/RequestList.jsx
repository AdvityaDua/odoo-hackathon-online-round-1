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
      new: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getTypeColor = (type) => {
    return type === 'preventive' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
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

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="corrective">Corrective</option>
                <option value="preventive">Preventive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filter.stage}
                onChange={(e) => setFilter({ ...filter, stage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
              <input
                type="text"
                placeholder="Equipment ID"
                value={filter.equipment}
                onChange={(e) => setFilter({ ...filter, equipment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No requests found.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <li key={request.id}>
                  <div
                    onClick={() => navigate(`/requests/${request.id}`)}
                    className="block hover:bg-gray-50 px-4 py-4 sm:px-6 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-lg font-medium text-gray-900">
                            {request.title || 'No Title'}
                          </p>
                          <span className={`ml-3 px-2 py-1 text-xs rounded ${getTypeColor(request.maintenance_type)}`}>
                            {request.maintenance_type}
                          </span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          {request.equipment_name && (
                            <span className="mr-4">Equipment: {request.equipment_name}</span>
                          )}
                          {request.scheduled_start && (
                            <span className="mr-4">
                              Scheduled: {new Date(request.scheduled_start).toLocaleDateString()}
                            </span>
                          )}
                          {request.technician_email && (
                            <span>Technician: {request.technician_email}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-gray-400">→</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default RequestList
