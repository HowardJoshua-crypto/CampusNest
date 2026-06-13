import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import ListingDetailPage from './pages/ListingDetailPage'
import ProfilePage from './pages/ProfilePage'
import MessagesPage from './pages/MessagesPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import LandlordDashboardPage from './pages/LandlordDashboardPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={
              <ProtectedRoute allowedRoles={['student']}>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="search" element={
              <ProtectedRoute allowedRoles={['student']}>
                <SearchPage />
              </ProtectedRoute>
            } />
            <Route path="listing/:id" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ListingDetailPage />
              </ProtectedRoute>
            } />
            <Route path="messages" element={
              <ProtectedRoute allowedRoles={['student', 'landlord']}>
                <MessagesPage />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute allowedRoles={['student', 'landlord', 'admin']}>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="landlord" element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <LandlordDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
