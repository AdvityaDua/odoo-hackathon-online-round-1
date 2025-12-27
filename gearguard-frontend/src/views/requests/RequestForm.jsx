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
      <div className="px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">New Maintenance Request</h1>
          <p className="mt-2 text-sm text-gray-600">
            Step {step} of 2: {step === 1 ? 'Check Availability' : 'Create Request'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {step === 1 ? (
          // Step 1: Availability Check
          <form onSubmit={handleAvailabilityCheck} className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment *
                </label>
                <select
                  name="equipment"
                  required
                  value={formData.equipment}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance Team *
                </label>
                <select
                  name="maintenance_team"
                  required
                  value={formData.maintenance_team}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Start *
                </label>
                <input
                  type="datetime-local"
                  name="scheduled_start"
                  required
                  value={formData.scheduled_start}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (hours) *
                </label>
                <input
                  type="number"
                  name="duration_hours"
                  required
                  min="1"
                  value={formData.duration_hours}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Link
                to="/requests"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={checkingAvailability}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {checkingAvailability ? 'Checking...' : 'Check Availability'}
              </button>
            </div>
          </form>
        ) : (
          // Step 2: Create Request
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
            {availabilityResult && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-medium text-green-900 mb-2">Availability Confirmed</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>Work Center: {availabilityResult.available_work_centers[0]?.name || 'N/A'}</p>
                  <p>Assigned Technician: {availabilityResult.assigned_technician?.email || 'N/A'}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="What is wrong? (e.g., Motor overheating)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description of the issue"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maintenance Type *
                </label>
                <select
                  name="maintenance_type"
                  required
                  value={formData.maintenance_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="corrective">Corrective (Breakdown)</option>
                  <option value="preventive">Preventive (Routine Checkup)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  name="priority"
                  required
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Read-only fields from availability check */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Assigned automatically:</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Work Center: {availabilityResult?.available_work_centers[0]?.name || 'N/A'}</p>
                  <p>Technician: {availabilityResult?.assigned_technician?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving || !availabilityResult}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  )
}

export default RequestForm
