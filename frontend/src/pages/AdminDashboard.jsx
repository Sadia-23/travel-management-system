import { useAuth } from '../context/AuthContext'

function AdminDashboard() {
  const { user, logout } = useAuth()
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome, {user?.full_name}.</p>
      <button onClick={logout} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md">Logout</button>
    </div>
  )
}

export default AdminDashboard