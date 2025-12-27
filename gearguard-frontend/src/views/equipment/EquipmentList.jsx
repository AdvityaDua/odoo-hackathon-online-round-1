import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getEquipment, deleteEquipment } from '../../services/api'
import Layout from '../../components/Layout'

function EquipmentList() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const data = await getEquipment()
      setEquipment(data)
    } catch (err) {
      setError(err.message || 'Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) {
      return
    }
    try {
      await deleteEquipment(id)
      setEquipment(equipment.filter(eq => eq.id !== id))
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

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Equipment</h1>
          {user?.role === 'admin' && (
            <Link
              to="/equipment/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Add Equipment
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {equipment.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No equipment found.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {equipment.map((eq) => (
                <li key={eq.id}>
                  <Link
                    to={`/equipment/${eq.id}`}
                    className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-lg font-medium text-gray-900">
                            {eq.name}
                          </p>
                          {eq.serial_number && (
                            <span className="ml-3 text-sm text-gray-500">
                              (SN: {eq.serial_number})
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          {eq.category && (
                            <span className="mr-4">Category: {eq.category.name}</span>
                          )}
                          {eq.department && (
                            <span className="mr-4">Dept: {eq.department.name}</span>
                          )}
                          {eq.company && (
                            <span>Company: {eq.company.name}</span>
                          )}
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex space-x-2">
                          <Link
                            to={`/equipment/${eq.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              handleDelete(eq.id)
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default EquipmentList
