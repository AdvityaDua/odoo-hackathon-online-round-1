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
    employee: '',
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
        employee: data.employee?.id || '',
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
        employee: formData.employee ? parseInt(formData.employee) : null,
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
      <div className="px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Equipment' : 'Add Equipment'}
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
                Equipment Name *
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
                Serial Number *
              </label>
              <input
                type="text"
                name="serial_number"
                required
                value={formData.serial_number}
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
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee assignment removed - handled by backend based on department */}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Link
              to="/equipment"
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

export default EquipmentForm
