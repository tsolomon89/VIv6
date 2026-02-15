import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminShell } from './components/Layout/AdminShell'
import { Dashboard } from './pages/Dashboard'
import { SiteStructure } from './pages/SiteStructure'
import { BuildStatus } from './pages/BuildStatus'
import { SettingsPage } from './pages/Settings'
import { VisualEditor } from './pages/VisualEditor'
import { LoginPage } from './pages/LoginPage'
import { BrandProvider } from './lib/BrandContext'
import { AuthProvider } from './lib/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Studio (Universal Record Workspace)
import { StudioLayout } from './features/Studio/layouts/StudioLayout'
import { StudioDashboard } from './features/Studio/pages/StudioDashboard'
import { RecordListPage } from './features/Studio/pages/RecordListPage'
import { RecordDetailView } from './features/Studio/pages/RecordDetailView'

function App() {
  return (
    <AuthProvider>
      <BrandProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Legacy/Admin Shell (Protected) */}
          <Route element={<ProtectedRoute><AdminShell /></ProtectedRoute>}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/sites" element={<SiteStructure />} />
            <Route path="/admin/builds" element={<BuildStatus />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>

          {/* Universal Studio Workspace (Protected) */}
          <Route path="/" element={<ProtectedRoute><StudioLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Main Dashboard */}
            <Route path="dashboard" element={<StudioDashboard />} />

            {/* Universal Record Routes */}
            {/* List View: View all records of a specific definition (e.g. /records/contact) */}
            <Route path="records/:type" element={<RecordListPage />} />

            {/* Detail View: View/Edit a specific record */}
            <Route path="records/:type/:id" element={<RecordDetailView />} />

            {/* Contextual Tools (e.g. Page Builder) */}
            {/* Note: In a real app, this might be a sub-route or a modal, here we map it to the Editor */}
            <Route path="records/:type/:id/page_builder" element={<VisualEditor />} />
          </Route>
        </Routes>
      </BrandProvider>
    </AuthProvider>
  )
}

export default App
