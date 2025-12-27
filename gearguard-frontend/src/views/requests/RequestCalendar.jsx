import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMaintenanceRequests } from '../../services/api'
import Layout from '../../components/Layout'

function RequestCalendar() {
  const navigate = useNavigate()
  const { user } = useAuth()
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
      if (Array.isArray(data)) {
        const preventive = data.filter(req => req.maintenance_type === 'preventive')
        setRequests(preventive)
      } else {
        setRequests([])
      }
    } catch (err) {
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
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Preventive Maintenance Calendar</h1>
            <p className="text-gray-600">View and manage scheduled preventive maintenance</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'user') && (
            <Link
              to="/requests/new"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
            >
              <span>➕</span>
              <span>New Request</span>
            </Link>
          )}
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={prevMonth}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700 hover:border-gray-400"
            >
              ← Prev
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700 hover:border-gray-400"
            >
              Next →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-3">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-bold text-gray-700 py-3 bg-gray-50 rounded-lg">
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
                  className={`min-h-[120px] border-2 rounded-xl p-2 transition-all ${
                    !day ? 'bg-gray-50 border-transparent' : 'bg-white border-gray-200 hover:border-blue-300 cursor-pointer hover:shadow-md'
                  } ${isToday ? 'ring-4 ring-blue-400 border-blue-500' : ''} ${
                    isSelected ? 'bg-blue-50 border-blue-400' : ''
                  }`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-bold mb-2 ${
                        isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
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
                            className="text-xs bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-1 rounded-lg truncate hover:from-purple-600 hover:to-indigo-600 shadow-sm cursor-pointer transition-all"
                          >
                            {req.title || 'No Title'}
                          </div>
                        ))}
                        {dayRequests.length > 2 && (
                          <div className="text-xs text-gray-500 font-semibold text-center pt-1">
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
            <div className="mt-8 border-t-2 border-gray-200 pt-6">
              <h3 className="font-bold text-xl text-gray-900 mb-4">
                Requests for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <div className="space-y-3">
                {getRequestsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No scheduled maintenance yet</p>
                  </div>
                ) : (
                  getRequestsForDate(selectedDate).map(req => (
                    <div
                      key={req.id}
                      onClick={() => navigate(`/requests/${req.id}`)}
                      className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl cursor-pointer hover:shadow-md transition-all border border-purple-200 hover:border-purple-300 transform hover:-translate-y-0.5"
                    >
                      <p className="font-semibold text-gray-900">{req.title || 'No Title'}</p>
                      {req.equipment_name && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center">
                          <span className="mr-2">⚙️</span>
                          {req.equipment_name}
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
