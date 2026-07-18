import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in both fields.')
      return
    }

    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        if (result.user.role === 'admin') {
          // Admins shouldn't use this form — redirect them to the admin portal
          navigate('/admin')
        } else if (result.user.role === 'provider') {
          navigate('/provider/dashboard')
        } else {
          navigate('/')
        }
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary mb-6">Sign In</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Don't have an account? <Link to="/register" className="text-primary font-medium">Register</Link>
        </p>
      </form>
    </div>
  )
}

export default Login