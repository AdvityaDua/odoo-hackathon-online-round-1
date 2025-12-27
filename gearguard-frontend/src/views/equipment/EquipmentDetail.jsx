import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getEquipmentById, deleteEquipment } from '../../services/api'
import Layout from '../../components/Layout'

function EquipmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [equipment, setEquipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [maintenanceRequests, setMaintenanceRequests] = useState([])

  useEffect(() => {
    fetchEquipment()
    // TODO: Fetch maintenance requests for this equipment
  }, [id])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const data = await getEquipmentById(id)
      setEquipment(data)
    } catch (err) {
      setError(err.message || 'Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) {
      return
    }
    try {
      await deleteEquipment(id)
      navigate('/equipment')
    } catch (err) {
      alert(err.message || 'Failed to delete equipment')
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

  if (error || !equipment) {
    return (
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Equipment not found'}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <Link
            to="/equipment"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Equipment
          </Link>
          {isAdmin && (
            <div className="flex space-x-2">
              <Link
                to={`/equipment/${id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
            {equipment.serial_number && (
              <p className="text-sm text-gray-500 mt-1">Serial: {equipment.serial_number}</p>
            )}
          </div>

          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {equipment.category && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900">{equipment.category.name}</dd>
                </div>
              )}
              {equipment.company && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Company</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {equipment.company.name} {equipment.company.location && `(${equipment.company.location})`}
                  </dd>
                </div>
              )}
              {equipment.department && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="mt-1 text-sm text-gray-900">{equipment.department.name}</dd>
                </div>
              )}
              {equipment.employee && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Assigned Employee</dt>
                  <dd className="mt-1 text-sm text-gray-900">{equipment.employee.email}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Smart Button: Maintenance Requests */}
          <div className="px-6 py-4 border-t border-gray-200">
            <Link
              to={`/requests?equipment=${id}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <span>Maintenance Requests</span>
              {maintenanceRequests.length > 0 && (
                <span className="ml-2 bg-blue-700 px-2 py-1 rounded text-xs">
                  {maintenanceRequests.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default EquipmentDetail
