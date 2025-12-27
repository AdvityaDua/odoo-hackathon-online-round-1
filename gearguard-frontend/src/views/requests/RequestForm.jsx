import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { checkMaintenanceAvailability, createMaintenanceRequest, getEquipmentSelect, getMaintenanceTeams } from '../../services/api'
import Layout from '../../components/Layout'

function RequestForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const isEdit = !!id
  const canCreate = user?.role === 'admin' || user?.role === 'user'

  const [step, setStep] = useState(1) // Step 1: Availability check, Step 2: Create request
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maintenance_type: 'corrective',
    priority: 'medium',
    equipment: '',
    maintenance_team: '',
    scheduled_start: '',
    duration_hours: '',
  })

  const [availabilityResult, setAvailabilityResult] = useState(null)
  const [equipmentList, setEquipmentList] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Only allow create for admin/user
    if (!isEdit && !canCreate) {
      navigate('/requests')
      return
    }
    
    // Edit not supported in new API - redirect
    if (isEdit) {
      navigate(`/requests/${id}`)
      return
    }

    fetchOptions()
  }, [id, canCreate, navigate, isEdit])

  const fetchOptions = async () => {
    try {
      const [equipment, maintenanceTeams] = await Promise.all([
        getEquipmentSelect(),
        getMaintenanceTeams(),
      ])
      setEquipmentList(equipment)
      setTeams(maintenanceTeams)
    } catch (err) {
      console.error('Error fetching options:', err)
      setError('Failed to load form options')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleAvailabilityCheck = async (e) => {
    e.preventDefault()
    setError('')

    // Validate required fields for availability check
    if (!formData.equipment || !formData.maintenance_team || !formData.scheduled_start || !formData.duration_hours) {
      setError('Please fill all required fields for availability check')
      return
    }

    setCheckingAvailability(true)

    try {
      const availabilityData = {
        equipment: parseInt(formData.equipment),
        maintenance_team: parseInt(formData.maintenance_team),
        scheduled_start: formData.scheduled_start,
        duration_hours: parseInt(formData.duration_hours),
      }

      const result = await checkMaintenanceAvailability(availabilityData)
      setAvailabilityResult(result)
      setStep(2) // Move to step 2: Create request
    } catch (err) {
      setError(err.message || 'Availability check failed. Please try different time or team.')
    } finally {
      setCheckingAvailability(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    if (!availabilityResult) {
      setError('Please complete availability check first')
      setSaving(false)
      return
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        maintenance_type: formData.maintenance_type,
        priority: formData.priority,
        equipment: parseInt(formData.equipment),
        work_center: availabilityResult.available_work_centers[0]?.id,
        assigned_team: parseInt(formData.maintenance_team),
        assigned_technician: availabilityResult.assigned_technician?.id,
        scheduled_start: formData.scheduled_start,
        duration_hours: parseInt(formData.duration_hours),
      }

      await createMaintenanceRequest(payload)
      navigate('/requests')
    } catch (err) {
      setError(err.message || 'Failed to create maintenance request')
    } finally {
      setSaving(false)
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
      <div className="px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">New Maintenance Request</h1>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className={`font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                  Check Availability
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className={`font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                  Create Request
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {step === 1 ? (
          // Step 1: Availability Check
          <form onSubmit={handleAvailabilityCheck} className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Equipment <span className="text-red-500">*</span>
                </label>
                <select
                  name="equipment"
                  required
                  value={formData.equipment}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select equipment</option>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} {eq.serial_number && `(SN: ${eq.serial_number})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maintenance Team <span className="text-red-500">*</span>
                </label>
                <select
                  name="maintenance_team"
                  required
                  value={formData.maintenance_team}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Scheduled Start <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduled_start"
                    required
                    value={formData.scheduled_start}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (hours) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="duration_hours"
                    required
                    min="1"
                    value={formData.duration_hours}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                to="/requests"
                className="px-6 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={checkingAvailability}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {checkingAvailability ? 'Checking...' : 'Check Availability →'}
              </button>
            </div>
          </form>
        ) : (
          // Step 2: Create Request
          <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
            {availabilityResult && (
              <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <h3 className="font-semibold text-green-900 text-lg">Availability Confirmed</h3>
                </div>
                <div className="text-sm text-green-800 space-y-2 ml-13">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">🏭 Work Center:</span>
                    <span>{availabilityResult.available_work_centers[0]?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">👤 Assigned Technician:</span>
                    <span>{availabilityResult.assigned_technician?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="What is wrong? (e.g., Motor overheating)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description of the issue"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maintenance Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="maintenance_type"
                    required
                    value={formData.maintenance_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="corrective">Corrective (Breakdown)</option>
                    <option value="preventive">Preventive (Routine Checkup)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="priority"
                    required
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Read-only fields from availability check */}
              <div className="pt-6 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Assigned Automatically:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <span className="mr-2">🏭</span>
                    <span className="text-gray-600">Work Center:</span>
                    <span className="ml-2 font-medium text-gray-900">{availabilityResult?.available_work_centers[0]?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">👤</span>
                    <span className="text-gray-600">Technician:</span>
                    <span className="ml-2 font-medium text-gray-900">{availabilityResult?.assigned_technician?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={saving || !availabilityResult}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {saving ? 'Creating...' : 'Create Request ✓'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  )
}

export default RequestForm
