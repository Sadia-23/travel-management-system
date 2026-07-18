import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/me.php')
      .then(res => {
        if (res.data.success) setUser(res.data.user)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/login.php', { email, password })
    if (res.data.success) setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    await api.post('/logout.php')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}