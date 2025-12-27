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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Equipment</h1>
            <p className="text-gray-600">Manage and track all your equipment assets</p>
          </div>
          {isAdmin && (
            <Link
              to="/equipment/new"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Add Equipment</span>
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {equipment.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⚙️</span>
            </div>
            <p className="text-gray-500 text-lg">No equipment found.</p>
            {isAdmin && (
              <Link
                to="/equipment/new"
                className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first equipment →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {equipment.map((eq) => (
              <div
                key={eq.id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1"
              >
                <Link to={`/equipment/${eq.id}`} className="block">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                          {eq.name}
                        </h3>
                        {eq.serial_number && (
                          <p className="text-sm text-gray-500">SN: {eq.serial_number}</p>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xl shadow-md">
                        ⚙️
                      </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      {eq.category && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          <span>Category: {eq.category.name}</span>
                        </div>
                      )}
                      {eq.department && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          <span>Dept: {eq.department.name}</span>
                        </div>
                      )}
                      {eq.company && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                          <span>{eq.company.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
                {isAdmin && (
                  <div className="px-6 pb-4 flex space-x-2 border-t border-gray-100 pt-4">
                    <Link
                      to={`/equipment/${eq.id}/edit`}
                      className="flex-1 text-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDelete(eq.id)
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default EquipmentList
