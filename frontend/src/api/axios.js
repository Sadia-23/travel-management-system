import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost/travel-management-system/backend/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export default api