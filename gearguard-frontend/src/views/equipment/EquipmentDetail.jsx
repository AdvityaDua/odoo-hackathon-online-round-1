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
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm">
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
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
          >
            <span>←</span>
            <span>Back to Equipment</span>
          </Link>
          {isAdmin && (
            <div className="flex space-x-3">
              <Link
                to={`/equipment/${id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{equipment.name}</h1>
                {equipment.serial_number && (
                  <p className="text-blue-100">Serial: {equipment.serial_number}</p>
                )}
              </div>
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-4xl backdrop-blur-sm">
                ⚙️
              </div>
            </div>
          </div>

          <div className="px-8 py-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {equipment.category && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <dt className="text-sm font-semibold text-gray-500 mb-1">Category</dt>
                  <dd className="text-lg font-medium text-gray-900">{equipment.category.name}</dd>
                </div>
              )}
              {equipment.company && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <dt className="text-sm font-semibold text-gray-500 mb-1">Company</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {equipment.company.name}
                    {equipment.company.location && (
                      <span className="text-sm text-gray-500 ml-2">({equipment.company.location})</span>
                    )}
                  </dd>
                </div>
              )}
              {equipment.department && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <dt className="text-sm font-semibold text-gray-500 mb-1">Department</dt>
                  <dd className="text-lg font-medium text-gray-900">{equipment.department.name}</dd>
                </div>
              )}
              {equipment.employee && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <dt className="text-sm font-semibold text-gray-500 mb-1">Assigned Employee</dt>
                  <dd className="text-lg font-medium text-gray-900">{equipment.employee.email}</dd>
                </div>
              )}
            </div>
          </div>

          {/* Smart Button: Maintenance Requests */}
          <div className="px-8 py-6 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <Link
              to={`/requests/list?equipment=${id}`}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="mr-2">🔧</span>
              <span>View Maintenance Requests</span>
              {maintenanceRequests.length > 0 && (
                <span className="ml-3 bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm font-semibold">
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
