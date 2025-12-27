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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
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
      <div className="px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isEdit ? 'Edit Team' : 'Create Maintenance Team'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update team information' : 'Set up a new maintenance team'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter team name (e.g., Mechanical Team)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company <span className="text-red-500">*</span>
              </label>
              <select
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Members (Technician User IDs) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter technician IDs separated by commas (e.g., 3, 5, 9)"
                value={formData.members.join(', ')}
                onChange={(e) => {
                  const ids = e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                  setFormData(prev => ({ ...prev, members: ids }))
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">ℹ️ Important Notes:</p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Only technician user IDs belonging to the selected company</li>
                  <li>Backend will validate role and company membership</li>
                  <li>All members must be technicians</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              to="/teams"
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-semibold hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default TeamForm
