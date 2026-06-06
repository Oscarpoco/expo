import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { MobileGate } from './components/MobileGate.jsx'
import { DashboardHomePage, DashboardLoginPage } from './pages/DashboardHomePage.jsx'
import { readDashboardSession } from './services/dashboardSession.js'

import './dashboard.css'

function ProtectedDashboard() {
  const session = readDashboardSession()
  if (!session) {
    return <Navigate to="/dashboard/login" replace />
  }
  return <DashboardHomePage session={session} />
}

function PublicLoginRoute({ children }) {
  const session = readDashboardSession()
  if (session) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export function DashboardApp() {
  useEffect(() => {
    document.body.classList.add('dashboard-mode')
    return () => {
      document.body.classList.remove('dashboard-mode')
    }
  }, [])

  return (
    <div className="dashboard-app">
      <MobileGate>
        <Routes>
          <Route
            path="login"
            element={
              <PublicLoginRoute>
                <DashboardLoginPage />
              </PublicLoginRoute>
            }
          />
          <Route index element={<ProtectedDashboard />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </MobileGate>
    </div>
  )
}
