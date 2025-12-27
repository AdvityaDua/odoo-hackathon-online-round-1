import { createContext, useContext, useState, useEffect } from 'react'
import api, { setAccessToken, clearAccessToken } from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessTokenState] = useState(null)

  // Initialize auth on mount by calling /refresh/
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await api.post('/refresh/')
        
        if (response.data.access && response.data.user) {
          const token = response.data.access
          const userData = response.data.user
          
          // Store token in memory only (not localStorage)
          setAccessToken(token)
          setAccessTokenState(token)
          setUser(userData)
          setIsAuthenticated(true)
          
          // Store user in localStorage (not token)
          localStorage.setItem('user', JSON.stringify(userData))
        } else {
          throw new Error('Invalid refresh response')
        }
      } catch (error) {
        // Refresh failed - user is not authenticated
        clearAccessToken()
        setAccessTokenState(null)
        setUser(null)
        setIsAuthenticated(false)
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Refresh access token using refresh token cookie
  const refreshAccessToken = async () => {
    try {
      const response = await api.post('/refresh/')
      
      if (response.data.access && response.data.user) {
        const token = response.data.access
        setAccessToken(token) // Update api.js token
        setAccessTokenState(token) // Update React state
        setUser(response.data.user)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return token
      }
      
      throw new Error('Invalid refresh response')
    } catch (error) {
      // Refresh failed, logout user
      logout()
      throw error
    }
  }

  const login = async (credentials) => {
    try {
      const response = await api.post('/login/', {
        email: credentials.email,
        password: credentials.password,
      })

      // Success response structure: { message, access, user }
      if (response.data.access && response.data.user) {
        const token = response.data.access
        const userData = response.data.user
        
        // Store token in memory only (not localStorage)
        setAccessToken(token)
        setAccessTokenState(token)
        setUser(userData)
        setIsAuthenticated(true)
        
        // Store user in localStorage (not token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        return { success: true }
      }

      return { success: false, error: response.data.message || 'Login failed' }
    } catch (error) {
      console.error('Login failed:', error)
      
      // Extract error message from axios error
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred'
      
      // Handle specific error messages from backend
      if (errorMessage.toLowerCase().includes('not found')) {
        return { success: false, error: 'User not found.' }
      }
      
      if (errorMessage.toLowerCase().includes('invalid') || 
          errorMessage.toLowerCase().includes('password')) {
        return { success: false, error: 'Invalid email or password.' }
      }
      
      if (errorMessage.toLowerCase().includes('required')) {
        return { success: false, error: 'Email and password are required.' }
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const signup = async (userData) => {
    try {
      // Prepare signup data according to API contract
      const signupData = {
        email: userData.email,
        password: userData.password,
        role: userData.role,
        department_id: userData.department_id,
        location_id: userData.location_id,
      }
      
      // Add admin_secret if role is admin
      if (userData.role === 'admin' && userData.admin_secret) {
        signupData.admin_secret = userData.admin_secret
      }
      
      const response = await api.post('/register/', signupData)

      // Success response: { message: "User registered successfully." }
      // After successful registration, user needs to login
      if (response.data.message) {
        return { success: true, message: response.data.message }
      }

      return { success: false, error: 'Registration failed' }
    } catch (error) {
      console.error('Signup failed:', error)
      
      // Extract error message from axios error
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'An error occurred'
      
      // Handle field-level errors: { "email": ["error"], "admin_secret": ["error"] }
      if (error.response?.data && typeof error.response.data === 'object') {
        const fieldErrors = Object.values(error.response.data).flat().filter(Boolean)
        if (fieldErrors.length > 0) {
          const errorText = fieldErrors[0]
          if (errorText.toLowerCase().includes('already exists')) {
            return { success: false, error: 'Email already exists in database' }
          }
          if (errorText.toLowerCase().includes('admin_secret') || errorText.toLowerCase().includes('admin secret')) {
            return { success: false, error: 'Invalid admin secret.' }
          }
          return { success: false, error: errorText }
        }
      }
      
      // Handle specific error messages from backend
      if (errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('duplicate')) {
        return { success: false, error: 'Email already exists in database' }
      }
      
      if (errorMessage.toLowerCase().includes('admin_secret') || 
          errorMessage.toLowerCase().includes('admin secret')) {
        return { success: false, error: 'Invalid admin secret.' }
      }
      
      if (errorMessage.toLowerCase().includes('required')) {
        return { success: false, error: 'All required fields must be filled.' }
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      // Call logout endpoint to clear refresh token cookie
      await api.post('/logout/')
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Clear frontend state regardless of API call result
      clearAccessToken()
      setAccessTokenState(null)
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('user')
      // Note: accessToken is NOT in localStorage anymore
    }
  }

  // Get current access token (for API calls)
  const getAccessToken = () => {
    return accessToken
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    signup,
    logout,
    refreshAccessToken,
    getAccessToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
