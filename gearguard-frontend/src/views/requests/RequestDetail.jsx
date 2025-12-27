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
      if (!data || typeof data !== 'object') {
        setError('Request not found or API not available')
        return
      }
      setRequest(data)
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
      new: 'bg-gray-100 text-gray-800 border-gray-300',
      scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      blocked: 'bg-orange-100 text-orange-800 border-orange-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
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

  if (error && !request) {
    return (
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm">
            {error}
          </div>
        </div>
      </Layout>
    )
  }

  const isAssignedTechnician = isTechnician && request?.technician_email === user?.email
  const canAddWorkLog = isAssignedTechnician && 
                         request?.status !== 'completed' && request?.status !== 'cancelled'

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/requests"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 group"
          >
            <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Requests
          </Link>
        </div>

        {/* Request Details Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 mb-6">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {request?.title || 'No Title'}
                </h1>
                <div className="flex items-center space-x-3 mt-3">
                  {request?.status && (
                    <span className={`px-4 py-1.5 text-sm font-semibold rounded-full border-2 ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                  )}
                  {request?.priority && (
                    <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-4xl backdrop-blur-sm shadow-lg">
                🔧
              </div>
            </div>
          </div>

          <div className="px-8 py-6">
            {request?.description && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-900 leading-relaxed">{request.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Type</dt>
                <dd className="text-lg font-semibold text-gray-900 capitalize">{request?.maintenance_type}</dd>
              </div>
              {request?.equipment_name && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Equipment</dt>
                  <dd className="text-lg font-semibold text-gray-900">{request.equipment_name}</dd>
                </div>
              )}
              {request?.work_center_name && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Work Center</dt>
                  <dd className="text-lg font-semibold text-gray-900">{request.work_center_name}</dd>
                </div>
              )}
              {request?.team_name && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-100">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Team</dt>
                  <dd className="text-lg font-semibold text-gray-900">{request.team_name}</dd>
                </div>
              )}
              {request?.technician_email && (
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-100">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Technician</dt>
                  <dd className="text-lg font-semibold text-gray-900">{request.technician_email}</dd>
                </div>
              )}
              {request?.scheduled_start && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Scheduled</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {new Date(request.scheduled_start).toLocaleDateString()}
                  </dd>
                  <dd className="text-sm text-gray-600 mt-1">
                    {new Date(request.scheduled_start).toLocaleTimeString()}
                  </dd>
                </div>
              )}
              {request?.duration_hours && (
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-100">
                  <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Duration</dt>
                  <dd className="text-lg font-semibold text-gray-900">{request.duration_hours} hours</dd>
                </div>
              )}
            </div>
          </div>

          {/* Technician Actions */}
          {canAddWorkLog && (
            <div className="px-8 py-6 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setShowWorkLogForm(!showWorkLogForm)
                    setShowReassignForm(false)
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>📝</span>
                  <span>{showWorkLogForm ? 'Cancel' : 'Add Work Log'}</span>
                </button>
                {request?.status !== 'completed' && request?.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      setShowReassignForm(!showReassignForm)
                      setShowWorkLogForm(false)
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
                  >
                    <span>🔄</span>
                    <span>Request Reassignment</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Work Log Form */}
        {showWorkLogForm && canAddWorkLog && (
          <div className="bg-white shadow-xl rounded-2xl p-8 mb-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                📝
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Add Work Log</h2>
            </div>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleAddWorkLog}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Note <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={workLogData.note}
                    onChange={(e) => setWorkLogData({ ...workLogData, note: e.target.value })}
                    placeholder="Describe the work performed or current status..."
                    rows="5"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={workLogData.status}
                    onChange={(e) => setWorkLogData({ ...workLogData, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? 'Submitting...' : 'Submit Work Log ✓'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reassignment Form */}
        {showReassignForm && canAddWorkLog && (
          <div className="bg-white shadow-xl rounded-2xl p-8 mb-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                🔄
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Request Reassignment</h2>
            </div>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleReassignment}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Team ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={reassignData.new_team}
                    onChange={(e) => setReassignData({ ...reassignData, new_team: e.target.value })}
                    placeholder="Enter new team ID"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={reassignData.reason}
                    onChange={(e) => setReassignData({ ...reassignData, reason: e.target.value })}
                    placeholder="Explain why reassignment is needed..."
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? 'Submitting...' : 'Request Reassignment ✓'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Work Log Timeline */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              📋
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Work Log Timeline</h2>
          </div>
          {workLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <p className="text-gray-500 text-lg">No work logs yet.</p>
              <p className="text-gray-400 text-sm mt-2">Work logs will appear here once technicians start updating the request.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workLogs.map((log, index) => (
                <div
                  key={log.id}
                  className={`relative pl-8 pb-6 ${
                    index !== workLogs.length - 1 ? 'border-l-2 border-gray-200' : ''
                  }`}
                >
                  <div className="absolute left-0 top-0 w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full border-4 border-white shadow-lg transform -translate-x-2"></div>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium leading-relaxed">{log.note}</p>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                              {log.technician_email?.charAt(0).toUpperCase()}
                            </div>
                            <span>{log.technician_email}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 ${getStatusColor(log.status)}`}>
                        {log.status.replace('_', ' ')}
                      </span>
                    </div>
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
