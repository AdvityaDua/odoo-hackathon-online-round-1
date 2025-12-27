import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { validateEmail, validatePassword } from '../../utils/validation'

function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  
  // Location options
  const locations = [
    { id: 1, name: 'GearGuard Industries', location: 'Ahmedabad Plant' },
    { id: 2, name: 'GearGuard R&D', location: 'Pune' },
  ]

const departments = [
  { id: 1, name: 'Production' },
  { id: 2, name: 'Maintenance' },
  { id: 3, name: 'IT' },
  { id: 4, name: 'Admin' },
]


  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    department_id: '',
    location_id: '',
    admin_secret: '',
  })
  
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [passwordErrors, setPasswordErrors] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    
    // Validate password in real-time
    if (name === 'password' && value) {
      const validation = validatePassword(value)
      setPasswordErrors(validation.errors)
    } else if (name === 'password' && !value) {
      setPasswordErrors([])
    }
    
    setSubmitError('')
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = 'Password does not meet requirements'
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role'
    }
    
    if (!formData.department_id) {
      newErrors.department_id = 'Department is required'
    }

    
    if (!formData.location_id) {
      newErrors.location_id = 'Location is required'
    }
    
    if (formData.role === 'admin' && !formData.admin_secret) {
      newErrors.admin_secret = 'Admin secret is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department_id: parseInt(formData.department_id),
        location_id: parseInt(formData.location_id),
      }
      
      if (formData.role === 'admin' && formData.admin_secret) {
        userData.admin_secret = formData.admin_secret
      }
      
      const result = await signup(userData)
      
      if (result.success) {
        // Registration successful - redirect to login page
        // User needs to login after registration
        navigate('/login', { 
          state: { message: result.message || 'Registration successful! Please login.' }
        })
      } else {
        setSubmitError(result.error || 'Signup failed. Please try again.')
      }
    } catch (error) {
      setSubmitError(error.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            GearGuard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleSubmit}>
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {passwordErrors.length > 0 && formData.password && (
                <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
                  {passwordErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Re-enter Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                id="department_id"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.department_id ? 'border-red-300' : 'border-gray-300'
                } text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              >
                <option value="">Select a department</option>
                {departments.map(dep => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>

              {errors.department_id && (
                <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>
              )}
            </div>

            
            <div>
              <label htmlFor="location_id" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                id="location_id"
                name="location_id"
                value={formData.location_id}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.location_id ? 'border-red-300' : 'border-gray-300'
                } text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
              >
                <option value="">Select a location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} | {loc.location}
                  </option>
                ))}
              </select>
              {errors.location_id && (
                <p className="mt-1 text-sm text-red-600">{errors.location_id}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.role ? 'border-red-300' : 'border-gray-300'
                } text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
              >
                <option value="user">Employee</option>
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>
            
            {formData.role === 'admin' && (
              <div>
                <label htmlFor="admin_secret" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Secret
                </label>
                <input
                  id="admin_secret"
                  name="admin_secret"
                  type="password"
                  required
                  value={formData.admin_secret}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    errors.admin_secret ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                  placeholder="Enter admin secret"
                />
                {errors.admin_secret && (
                  <p className="mt-1 text-sm text-red-600">{errors.admin_secret}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Admin secret is verified by the backend
                </p>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup
