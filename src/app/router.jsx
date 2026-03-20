import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Pages (import lazily or directly — direct for now)
import LoginPage from '../pages/LoginPage'
import PendingPage from '../pages/PendingPage'
import RejectedPage from '../pages/RejectedPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import BoardPage from '../features/board/BoardPage'
import MyOrdersPage from '../features/orders/MyOrdersPage'
import FoodCatalogPage from '../features/food/FoodCatalogPage'
import AdminUsersPage from '../features/users/AdminUsersPage'
import ProfilePage from '../features/users/ProfilePage'
import BodyCalculatorPage from '../features/body/BodyCalculatorPage'
import AIPage from '../features/ai/AIPage'
import AcceptInvitePage from '../pages/AcceptInvitePage'

function PublicRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (session) return <Navigate to="/" replace />
  return children
}

function ProtectedRoute({ children }) {
  const { session, profile, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!session) return <Navigate to="/login" replace />
  if (profile?.status === 'pending') return <Navigate to="/pending" replace />
  if (profile?.status === 'rejected') return <Navigate to="/rejected" replace />
  return children
}

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/accept-invite" element={<AcceptInvitePage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/pending" element={<PendingPage />} />
        <Route path="/rejected" element={<RejectedPage />} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/food" element={<AdminRoute><FoodCatalogPage /></AdminRoute>} />
          <Route path="/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/body" element={<BodyCalculatorPage />} />
          <Route path="/ai" element={<AIPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
