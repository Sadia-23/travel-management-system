import { Link, useNavigate } from 'react-router-dom'
import { FaPlane } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
        <FaPlane />
        Travel Management System
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/" className="text-gray-700 hover:text-primary-dark">Home</Link>
        <Link to="/hotels" className="text-gray-700 hover:text-primary-dark">Hotels</Link>
        <Link to="/about" className="text-gray-700 hover:text-primary-dark">About</Link>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-neutral-dark text-sm">Hi, {user.full_name}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-white bg-primary px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-700 hover:text-primary-dark">Login</Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-primary px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
