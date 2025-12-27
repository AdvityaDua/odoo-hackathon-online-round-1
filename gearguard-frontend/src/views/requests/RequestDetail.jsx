import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMaintenanceRequestById, getMaintenanceWorkLogs, addWorkLog, requestReassignment } from '../../services/api'
import Layout from '../../components/Layout'

function RequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isTechnician = user?.role === 'technician'
  const isAssignedTechnician = false // Will be set based on request data

  const [request, setRequest] = useState(null)
  const [workLogs, setWorkLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showWorkLogForm, setShowWorkLogForm] = useState(false)
  const [showReassignForm, setShowReassignForm] = useState(false)
  const [workLogData, setWorkLogData] = useState({
    note: '',
    status: 'in_progress',
  })
  const [reassignData, setReassignData] = useState({
    new_team: '',
    reason: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRequest()
    fetchWorkLogs()
  }, [id])

  const fetchRequest = async () => {
    try {
      setLoading(true)
      const data = await getMaintenanceRequestById(id)
      // Handle case where API might not exist
      if (!data || typeof data !== 'object') {
        setError('Request not found or API not available')
        return
      }
      setRequest(data)
      // Check if current user is the assigned technician
      if (isTechnician && data.assigned_technician && user?.email === data.technician_email) {
        // User is assigned technician
      }
    } catch (err) {
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setError('Request not found or maintenance API not available yet.')
      } else {
        setError(err.message || 'Failed to load request')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkLogs = async () => {
    try {
      const data = await getMaintenanceWorkLogs(id)
      if (Array.isArray(data)) {
        setWorkLogs(data)
      } else {
        setWorkLogs([])
      }
    } catch (err) {
      // Gracefully handle if work logs API not available
      setWorkLogs([])
    }
  }

  const handleAddWorkLog = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await addWorkLog({
        maintenance_id: parseInt(id),
        note: workLogData.note,
        status: workLogData.status,
      })
      
      // Refresh data
      await Promise.all([fetchRequest(), fetchWorkLogs()])
      setShowWorkLogForm(false)
      setWorkLogData({ note: '', status: 'in_progress' })
    } catch (err) {
      setError(err.message || 'Failed to add work log')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReassignment = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await requestReassignment({
        maintenance_id: parseInt(id),
        new_team: parseInt(reassignData.new_team),
        reason: reassignData.reason,
      })
      
      // Refresh data
      await fetchRequest()
      setShowReassignForm(false)
      setReassignData({ new_team: '', reason: '' })
      alert('Reassignment requested successfully')
    } catch (err) {
      setError(err.message || 'Failed to request reassignment')
    } finally {
      setSubmitting(false)
    }
  }

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

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (error && !request) {
    return (
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </Layout>
    )
  }

  const canAddWorkLog = isTechnician && request?.technician_email === user?.email && 
                         request?.status !== 'completed' && request?.status !== 'cancelled'

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <Link
            to="/requests"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Requests
          </Link>
        </div>

        {/* Request Details */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {request?.title || 'No Title'}
              </h1>
              {request?.status && (
                <span className={`px-3 py-1 text-sm rounded ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              )}
            </div>
          </div>

          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {request?.description && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{request?.maintenance_type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Priority</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize">{request?.priority}</dd>
              </div>
              {request?.equipment_name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Equipment</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.equipment_name}</dd>
                </div>
              )}
              {request?.work_center_name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Work Center</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.work_center_name}</dd>
                </div>
              )}
              {request?.team_name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assigned Team</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.team_name}</dd>
                </div>
              )}
              {request?.technician_email && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assigned Technician</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.technician_email}</dd>
                </div>
              )}
              {request?.scheduled_start && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Scheduled Start</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(request.scheduled_start).toLocaleString()}
                  </dd>
                </div>
              )}
              {request?.duration_hours && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Duration</dt>
                  <dd className="mt-1 text-sm text-gray-900">{request.duration_hours} hours</dd>
                </div>
              )}
              {request?.created_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(request.created_at).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Technician Actions */}
          {canAddWorkLog && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowWorkLogForm(!showWorkLogForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  {showWorkLogForm ? 'Cancel' : 'Add Work Log'}
                </button>
                {request?.status !== 'completed' && request?.status !== 'cancelled' && (
                  <button
                    onClick={() => setShowReassignForm(!showReassignForm)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700"
                  >
                    Request Reassignment
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Work Log Form */}
        {showWorkLogForm && canAddWorkLog && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Work Log</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleAddWorkLog}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note *
                  </label>
                  <textarea
                    required
                    value={workLogData.note}
                    onChange={(e) => setWorkLogData({ ...workLogData, note: e.target.value })}
                    placeholder="Describe the work performed or current status"
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    required
                    value={workLogData.status}
                    onChange={(e) => setWorkLogData({ ...workLogData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Work Log'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reassignment Form */}
        {showReassignForm && canAddWorkLog && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Reassignment</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleReassignment}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Team *
                  </label>
                  <input
                    type="number"
                    required
                    value={reassignData.new_team}
                    onChange={(e) => setReassignData({ ...reassignData, new_team: e.target.value })}
                    placeholder="Enter new team ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason *
                  </label>
                  <textarea
                    required
                    value={reassignData.reason}
                    onChange={(e) => setReassignData({ ...reassignData, reason: e.target.value })}
                    placeholder="Explain why reassignment is needed"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Request Reassignment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Work Log Timeline */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Log Timeline</h2>
          {workLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No work logs yet.</p>
          ) : (
            <div className="space-y-4">
              {workLogs.map((log) => (
                <div key={log.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-900">{log.note}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {log.technician_email} • {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default RequestDetail
