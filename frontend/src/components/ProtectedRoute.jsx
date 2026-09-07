import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    const fallback =
      user.role === 'admin' || user.role === 'manager'
        ? '/dashboard'
        : user.role === 'technician'
          ? '/my-dashboard'
          : '/tickets'
    return <Navigate to={fallback} replace />
  }

  return children
}
