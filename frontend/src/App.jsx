import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import Hotels from './pages/Hotels'
import HotelDetails from './pages/HotelDetails'
import Transport from './pages/Transport'
import TransportDetails from './pages/TransportDetails'
import Dashboard from './pages/Dashboard'
import ProviderDashboard from './pages/ProviderDashboard'
import AIPlanner from './pages/AIPlanner'
import NotFound from './pages/NotFound'


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/hotels" element={<Hotels />} />
              <Route path="/hotels/:id" element={<HotelDetails />} />

              <Route path="/transport" element={<Transport />} />
              <Route path="/transport/:id" element={<TransportDetails />} />

              <Route path="/ai-planner" element={<AIPlanner />} />

              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['traveler']}>
                  <Dashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/provider/dashboard" element={
                <ProtectedRoute allowedRoles={['provider']}>
                  <ProviderDashboard />
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App