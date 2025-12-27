import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMaintenanceRequests } from '../../services/api'
import Layout from '../../components/Layout'

function RequestCalendar() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await getMaintenanceRequests()
      // Handle case where API might not exist or returns non-array
      if (Array.isArray(data)) {
        // Filter only preventive maintenance requests
        const preventive = data.filter(req => req.maintenance_type === 'preventive')
        setRequests(preventive)
      } else {
        setRequests([])
      }
    } catch (err) {
      // Gracefully handle API not available
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setRequests([])
      } else {
        console.error('Error fetching requests:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getRequestsForDate = (date) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return requests.filter(req => {
      if (!req.scheduled_start) return false
      const reqDate = new Date(req.scheduled_start).toISOString().split('T')[0]
      return reqDate === dateStr
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const days = getDaysInMonth(currentDate)

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
          <h1 className="text-3xl font-bold text-gray-900">Preventive Maintenance Calendar</h1>
          {(user?.role === 'admin' || user?.role === 'user') && (
            <Link
              to="/requests/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              New Request
            </Link>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={prevMonth}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Prev
            </button>
            <h2 className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Next →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const dayRequests = getRequestsForDate(day)
              const isToday = day && day.toDateString() === new Date().toDateString()
              const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString()

              return (
                <div
                  key={index}
                  onClick={() => day && setSelectedDate(day)}
                  className={`min-h-[100px] border border-gray-200 rounded p-2 ${
                    !day ? 'bg-gray-50' : 'bg-white hover:bg-gray-50 cursor-pointer'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayRequests.slice(0, 2).map(req => (
                          <div
                            key={req.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/requests/${req.id}`)
                            }}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate hover:bg-blue-200"
                          >
                            {req.title || 'No Title'}
                          </div>
                        ))}
                        {dayRequests.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayRequests.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {selectedDate && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-2">
                Requests for {selectedDate.toLocaleDateString()}
              </h3>
              <div className="space-y-2">
                {getRequestsForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-500 text-sm">No requests scheduled</p>
                ) : (
                  getRequestsForDate(selectedDate).map(req => (
                    <div
                      key={req.id}
                      onClick={() => navigate(`/requests/${req.id}`)}
                      className="bg-gray-50 p-3 rounded cursor-pointer hover:bg-gray-100"
                    >
                      <p className="font-medium text-sm">{req.title || 'No Title'}</p>
                      {req.equipment_name && (
                        <p className="text-xs text-gray-600 mt-1">
                          Equipment: {req.equipment_name}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default RequestCalendar
