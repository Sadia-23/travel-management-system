import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost/travel-management-system/backend', // update once PHP backend URL is confirmed
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api