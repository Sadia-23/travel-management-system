import { Link } from 'react-router-dom'
import { FaPlane } from 'react-icons/fa'

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
        <FaPlane />
        Travel Management System
      </Link>
      <div className="flex gap-6">
        <Link to="/" className="text-gray-700 hover:text-primary-dark">Home</Link>
        <Link to="/about" className="text-gray-700 hover:text-primary-dark">About</Link>
      </div>
    </nav>
  )
}

export default Navbar