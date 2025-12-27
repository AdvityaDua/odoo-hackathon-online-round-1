import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { validateEmail, validatePassword } from '../../utils/validation'

function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  
  // Hardcoded locations (companies)
  const locations = [
    { id: 1, name: 'GearGuard Industries', location: 'Ahmedabad Plant' },
    { id: 2, name: 'GearGuard R&D', location: 'Pune' },
  ]

  // Hardcoded departments
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl mb-4 transform hover:scale-105 transition-transform">
            <span className="text-white text-4xl font-bold">G</span>
          </div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            GearGuard
          </h2>
          <p className="text-gray-600 font-medium">Create your account</p>
        </div>
        
        <form className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100" onSubmit={handleSubmit}>
          {submitError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm" role="alert">
              <p className="font-medium">Error</p>
              <p className="text-sm">{submitError}</p>
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.email 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.password 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                }`}
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
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Re-enter Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.confirmPassword 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="department_id" className="block text-sm font-semibold text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="department_id"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white ${
                  errors.department_id 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="location_id" className="block text-sm font-semibold text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                id="location_id"
                name="location_id"
                value={formData.location_id}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white ${
                  errors.location_id 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                }`}
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
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white ${
                  errors.role 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                <option value="user">User</option>
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>
            
            {formData.role === 'admin' && (
              <div>
                <label htmlFor="admin_secret" className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Secret <span className="text-red-500">*</span>
                </label>
                <input
                  id="admin_secret"
                  name="admin_secret"
                  type="password"
                  required
                  value={formData.admin_secret}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.admin_secret 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                  }`}
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
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
