import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ExpoApp } from './ExpoApp.jsx'
import { MemberPublicApp } from './member-public/MemberPublicApp.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExpoApp />} />
        <Route path="/:memberSlug" element={<MemberPublicApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
