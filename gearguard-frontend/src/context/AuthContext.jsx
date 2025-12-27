import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

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

  useEffect(() => {
    // Check if user is authenticated from localStorage
    // Note: In production, you should validate the token with the backend
    const token = localStorage.getItem('accessToken')
    const savedUser = localStorage.getItem('user')

    // Only set authenticated if both token and user exist
    // TODO: Add token validation with backend to ensure token is still valid
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        // If user data is invalid, clear localStorage
        console.error('Error parsing user data:', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        setIsAuthenticated(false)
      }
    } else {
      // Clear any partial data
      if (token) localStorage.removeItem('accessToken')
      if (savedUser) localStorage.removeItem('user')
      setIsAuthenticated(false)
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      // TODO: Replace endpoint with actual backend endpoint
      // Expected API response structure:
      // Success: { success: true, data: { accessToken, user } }
      // Error: { success: false, message: "Account not exist" | "Invalid Password" }
      
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      })

      // Only authenticate if response indicates success AND has required data
      const token = response.data?.accessToken || response.accessToken
      const userData = response.data?.user || response.user

      if (response.success === true && token && userData) {
        localStorage.setItem('accessToken', token)
        localStorage.setItem('user', JSON.stringify(userData))

        setUser(userData)
        setIsAuthenticated(true)
        return { success: true }
      }

      // If we reach here, authentication failed
      return { success: false, error: response.message || response.error || 'Login failed' }
    } catch (error) {
      console.error('Login failed:', error)
      
      // Handle specific error messages from backend
      const errorMessage = error.message || 'An error occurred'
      
      // Check for specific error messages
      if (errorMessage.toLowerCase().includes('not exist') || 
          errorMessage.toLowerCase().includes('not found')) {
        return { success: false, error: 'Account not exist' }
      }
      
      if (errorMessage.toLowerCase().includes('password') || 
          errorMessage.toLowerCase().includes('invalid')) {
        return { success: false, error: 'Invalid Password' }
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const signup = async (userData) => {
    try {
      // TODO: Replace endpoint with actual backend endpoint
      // Expected API response structure:
      // Success: { success: true, data: { accessToken, user } }
      // Error: { success: false, message: "Email already exists" | "Admin password incorrect" | etc }
      
      const signupData = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
      }
      
      if (userData.role === 'admin' && userData.adminPassword) {
        signupData.adminPassword = userData.adminPassword
      }
      
      const response = await api.post('/auth/signup', signupData)

      // Only authenticate if response indicates success AND has required data
      const token = response.data?.accessToken || response.accessToken
      const userDataResponse = response.data?.user || response.user

      if (response.success === true && token && userDataResponse) {
        localStorage.setItem('accessToken', token)
        localStorage.setItem('user', JSON.stringify(userDataResponse))

        setUser(userDataResponse)
        setIsAuthenticated(true)
        return { success: true }
      }

      // If we reach here, signup failed
      return { success: false, error: response.message || response.error || 'Signup failed' }
    } catch (error) {
      console.error('Signup failed:', error)
      
      const errorMessage = error.message || 'An error occurred'
      
      // Check for specific error messages
      if (errorMessage.toLowerCase().includes('duplicate') || 
          errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('already registered')) {
        return { success: false, error: 'Email already exists in database' }
      }
      
      if (errorMessage.toLowerCase().includes('admin') && 
          errorMessage.toLowerCase().includes('password')) {
        return { success: false, error: 'Admin password is incorrect' }
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    signup,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
