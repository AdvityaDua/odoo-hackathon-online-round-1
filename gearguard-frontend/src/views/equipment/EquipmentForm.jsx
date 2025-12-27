import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getEquipmentById, createEquipment, updateEquipment, getEquipmentCategories, getEquipmentSelect, getDepartmentsSelect, getCompaniesSelect } from '../../services/api'
import Layout from '../../components/Layout'

function EquipmentForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    company: '',
    category: '',
    department: '',
  })

  const [categories, setCategories] = useState([])
  const [departments, setDepartments] = useState([])
  const [companies, setCompanies] = useState([])
  const [equipmentList, setEquipmentList] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOptions()
    if (isEdit) {
      fetchEquipment()
    } else {
      setLoading(false)
    }
  }, [id])

  const fetchOptions = async () => {
    try {
      const [cats, depts, comps] = await Promise.all([
        getEquipmentCategories(),
        getDepartmentsSelect(),
        getCompaniesSelect(),
      ])
      setCategories(cats)
      setDepartments(depts)
      setCompanies(comps)
    } catch (err) {
      console.error('Error fetching options:', err)
    }
  }

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const data = await getEquipmentById(id)
      setFormData({
        name: data.name || '',
        serial_number: data.serial_number || '',
        company: data.company?.id || '',
        category: data.category?.id || '',
        department: data.department?.id || '',
      })
    } catch (err) {
      setError(err.message || 'Failed to load equipment')
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

    try {
      const payload = {
        name: formData.name,
        serial_number: formData.serial_number,
        company: parseInt(formData.company),
        category: parseInt(formData.category),
        department: formData.department ? parseInt(formData.department) : null,
      }

      if (isEdit) {
        await updateEquipment(id, payload)
      } else {
        await createEquipment(payload)
      }
      navigate('/equipment')
    } catch (err) {
      setError(err.message || 'Failed to save equipment')
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
            {isEdit ? 'Edit Equipment' : 'Add New Equipment'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update equipment information' : 'Register a new equipment asset'}
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
                Equipment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter equipment name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Serial Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="serial_number"
                required
                value={formData.serial_number}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter serial number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  name="company"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
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
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              to="/equipment"
              className="px-6 py-3 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Equipment' : 'Create Equipment'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default EquipmentForm
