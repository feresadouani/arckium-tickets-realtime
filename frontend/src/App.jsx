import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TicketProvider } from './context/TicketContext'
import { EquipmentProvider } from './context/EquipmentContext'
import { NotificationProvider } from './context/NotificationContext'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import TechnicianDashboard from './pages/TechnicianDashboard'
import TicketList from './pages/TicketList'
import NewTicket from './pages/NewTicket'
import TicketDetail from './pages/TicketDetail'
import Users from './pages/Users'
import NewUser from './pages/NewUser'
import Equipments from './pages/Equipments'
import NewEquipment from './pages/NewEquipment'

function getDefaultRoute(role) {
  if (role === 'admin' || role === 'manager') return '/dashboard'
  if (role === 'technician') return '/my-dashboard'
  return '/tickets'
}

function AppRoutes() {
  const { isAuthenticated, user, loading, needsSetup } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    )
  }

  if (needsSetup) {
    return (
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to={getDefaultRoute(user.role)} replace /> : <Login />
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-dashboard"
          element={
            <ProtectedRoute roles={['technician']}>
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/new"
          element={
            <ProtectedRoute roles={['admin']}>
              <NewUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipments"
          element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <Equipments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipments/new"
          element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <NewEquipment />
            </ProtectedRoute>
          }
        />
        <Route path="/tickets" element={<TicketList />} />
        <Route
          path="/tickets/new"
          element={
            <ProtectedRoute roles={['admin', 'manager', 'technician', 'operator']}>
              <NewTicket />
            </ProtectedRoute>
          }
        />
        <Route path="/tickets/:id" element={<TicketDetail />} />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? getDefaultRoute(user?.role) : '/login'}
            replace
          />
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EquipmentProvider>
          <TicketProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </TicketProvider>
        </EquipmentProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
