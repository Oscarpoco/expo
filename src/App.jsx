import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { ExpoApp } from './ExpoApp.jsx'
import { MemberPublicApp } from './member-public/MemberPublicApp.jsx'

function AppRoutes() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="morph-surface morph-surface--route">
      <Routes location={location}>
        <Route path="/" element={<ExpoApp />} />
        <Route path="/:memberSlug" element={<MemberPublicApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
