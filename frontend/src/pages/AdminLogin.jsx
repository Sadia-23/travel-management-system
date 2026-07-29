import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaShieldAlt } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Alert from '../components/ui/Alert'
import FormField, { inputClass } from '../components/ui/FormField'
import Button from '../components/ui/Button'

// enter with "/admin"
function AdminLogin() {
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
        if (result.user.role !== 'admin') {
          setError('This portal is for administrator accounts only.')
          return
        }
        navigate('/admin/dashboard')
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
    <div
      className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4"
      style={{
        backgroundColor: 'var(--color-neutral-dark)',
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
    >
      <Card as="form" onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <span className="w-11 h-11 rounded-full bg-neutral-dark text-white flex items-center justify-center text-lg mb-3">
            <FaShieldAlt />
          </span>
          <h1 className="font-display text-2xl font-semibold text-neutral-dark">Admin portal</h1>
          <p className="text-sm text-gray-500 mt-1">Authorized personnel only.</p>
        </div>

        {error && <Alert tone="danger" className="mb-4">{error}</Alert>}

        <div className="space-y-4">
          <FormField label="Email" htmlFor="admin-email">
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
            />
          </FormField>

          <FormField label="Password" htmlFor="admin-password">
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </FormField>
        </div>

        <Button type="submit" variant="dark" loading={loading} full className="mt-6">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </Card>
    </div>
  )
}

export default AdminLogin
