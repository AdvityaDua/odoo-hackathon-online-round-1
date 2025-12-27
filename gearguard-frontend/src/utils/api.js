import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

// Store access token in memory (module-level variable)
let accessToken = null

// Function to set access token (called from AuthContext)
export const setAccessToken = (token) => {
  accessToken = token
}

// Function to clear access token
export const clearAccessToken = () => {
  accessToken = null
}

// Add Authorization header if token exists (from memory)
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Auto-refresh on 401 errors
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Only handle 401 errors and don't retry refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/refresh/')) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Call refresh endpoint (no auth header needed, uses cookie)
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/refresh/`, {}, {
          withCredentials: true
        })
        const newToken = res.data.access
        
        // Update token in memory
        setAccessToken(newToken)
        
        // Process queued requests
        processQueue(null, newToken)
        isRefreshing = false

        // Retry original request with new token
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken
        return api(originalRequest)
      } catch (err) {
        // Refresh failed, clear everything and redirect to login
        processQueue(err, null)
        isRefreshing = false
        clearAccessToken()
        
        // Trigger logout by redirecting
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

export default api
