/**
 * API utility functions
 * TODO: Replace baseURL with actual backend URL when available
 */

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const api = {
  async post(endpoint, data) {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      // Handle non-JSON responses
      let result
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        result = await response.json()
      } else {
        const text = await response.text()
        throw new Error(text || 'Request failed')
      }
      
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Request failed')
      }
      
      return result
    } catch (error) {
      // Re-throw the error with a proper message
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server')
      }
      throw error
    }
  },

  async get(endpoint) {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Request failed')
      }
      
      return result
    } catch (error) {
      throw error
    }
  },
}

export default api

