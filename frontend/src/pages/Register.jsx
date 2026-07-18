import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
//traveler/proivider registration form
function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '', role: 'traveler' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.full_name || !form.email || !form.password) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/register.php', form)
      if (res.data.success) {
        navigate('/login')
      } else {
        setError(res.data.error)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light px-4 py-10">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary mb-6">Create Account</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input name="full_name" value={form.full_name} onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary" />

        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary" />

        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary" />

        <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
        <select name="role" value={form.role} onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="traveler">Traveler</option>
          <option value="provider">Service Provider</option>
        </select>

        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary" />

        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input name="confirm" type="password" value={form.confirm} onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-primary" />

        <button type="submit" disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition">
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-primary font-medium">Sign In</Link>
        </p>
      </form>
    </div>
  )
}

export default Register