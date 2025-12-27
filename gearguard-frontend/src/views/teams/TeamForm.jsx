import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMaintenanceTeamById, createMaintenanceTeam, updateMaintenanceTeam, getCompaniesSelect } from '../../services/api'
import Layout from '../../components/Layout'

function TeamForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const isEdit = !!id
  const isAdmin = user?.role === 'admin'

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    members: [],
  })

  const [companies, setCompanies] = useState([])
  const [availableTechnicians, setAvailableTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Only admin can access team forms
    if (!isAdmin) {
      navigate('/teams')
      return
    }
    
    fetchOptions()
    if (isEdit) {
      fetchTeam()
    } else {
      setLoading(false)
    }
  }, [id, isAdmin, navigate, isEdit])

  const fetchOptions = async () => {
    try {
      const comps = await getCompaniesSelect()
      setCompanies(comps)
      // TODO: Fetch available technicians based on company
    } catch (err) {
      console.error('Error fetching options:', err)
    }
  }

  const fetchTeam = async () => {
    try {
      setLoading(true)
      const data = await getMaintenanceTeamById(id)
      setFormData({
        name: data.name || '',
        company: data.company || '',
        members: data.members?.map(m => m.id) || [],
      })
    } catch (err) {
      setError(err.message || 'Failed to load team')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Validate members
    if (formData.members.length === 0) {
      setError('At least one member is required')
      setSaving(false)
      return
    }

    try {
      const payload = {
        name: formData.name,
        company: parseInt(formData.company),
        members: formData.members.map(m => parseInt(m)),
      }

      if (isEdit) {
        await updateMaintenanceTeam(id, payload)
      } else {
        await createMaintenanceTeam(payload)
      }
      navigate('/teams')
    } catch (err) {
      setError(err.message || 'Failed to save team')
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
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Team' : 'Add Maintenance Team'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company *
              </label>
              <select
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select company</option>
                {companies.map(comp => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name} | {comp.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Members (Technician IDs) *
              </label>
              <input
                type="text"
                required
                placeholder="Enter technician IDs separated by commas (e.g., 3, 5)"
                value={formData.members.join(', ')}
                onChange={(e) => {
                  const ids = e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                  setFormData(prev => ({ ...prev, members: ids }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Only technician user IDs belonging to the selected company. Backend will validate role and company membership.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Link
              to="/teams"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default TeamForm
