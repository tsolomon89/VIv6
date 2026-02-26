import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { BrandProvider } from './lib/BrandContext'
import { AuthProvider } from './lib/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'

// Eagerly loaded (small, needed immediately)
import { LoginPage } from './pages/LoginPage'
import { AdminShell } from './components/Layout/AdminShell'

// Lazy-loaded pages (code splitting)
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const SiteStructure = lazy(() => import('./pages/SiteStructure').then(m => ({ default: m.SiteStructure })))
const BuildStatus = lazy(() => import('./pages/BuildStatus').then(m => ({ default: m.BuildStatus })))
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.SettingsPage })))
const VisualEditor = lazy(() => import('./pages/VisualEditor').then(m => ({ default: m.VisualEditor })))
const PageList = lazy(() => import('./pages/PageList').then(m => ({ default: m.PageList })))
const AISettingsPage = lazy(() => import('./pages/AISettingsPage').then(m => ({ default: m.AISettingsPage })))
const AIApprovalsPage = lazy(() => import('./pages/AIApprovalsPage').then(m => ({ default: m.AIApprovalsPage })))
const AIActivitiesPage = lazy(() => import('./pages/AIActivitiesPage').then(m => ({ default: m.AIActivitiesPage })))
const AIUsagePage = lazy(() => import('./pages/AIUsagePage').then(m => ({ default: m.AIUsagePage })))

// Studio (Universal Record Workspace) - lazy loaded
const StudioLayout = lazy(() => import('./features/Studio/layouts/StudioLayout').then(m => ({ default: m.StudioLayout })))
const StudioDashboard = lazy(() => import('./features/Studio/pages/StudioDashboard').then(m => ({ default: m.StudioDashboard })))
const RecordListPage = lazy(() => import('./features/Studio/pages/RecordListPage').then(m => ({ default: m.RecordListPage })))
const RecordDetailView = lazy(() => import('./features/Studio/pages/RecordDetailView').then(m => ({ default: m.RecordDetailView })))
const ObjectDefEditor = lazy(() => import('./features/Studio/components/schema').then(m => ({ default: m.ObjectDefEditor })))

// Config Workspace pages - lazy loaded
const WorkspaceList = lazy(() => import('./pages/WorkspaceList').then(m => ({ default: m.WorkspaceList })))
const WorkspaceDetail = lazy(() => import('./pages/WorkspaceDetail').then(m => ({ default: m.WorkspaceDetail })))
const ConfigBrowser = lazy(() => import('./pages/ConfigBrowser').then(m => ({ default: m.ConfigBrowser })))
const ConfigDetailView = lazy(() => import('./pages/ConfigDetailView').then(m => ({ default: m.ConfigDetailView })))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-sm text-zinc-500">Loading...</span>
      </div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrandProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                borderRadius: '0.5rem',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
          <Suspense fallback={<PageLoader />}>
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

                {/* Webbuilder Routes */}
                <Route path="pages" element={<PageList />} />
                <Route path="editor" element={<VisualEditor />} />

                {/* Universal Record Routes */}
                {/* List View: View all records of a specific definition (e.g. /records/contact) */}
                <Route path="records/:type" element={<RecordListPage />} />

                {/* Schema Editor for object_def (must come before generic detail view) */}
                <Route path="records/object_def/:id/schema" element={<ObjectDefEditor />} />

                {/* Detail View: View/Edit a specific record */}
                <Route path="records/:type/:id" element={<RecordDetailView />} />

                {/* Contextual Tools (e.g. Page Builder) */}
                {/* Note: In a real app, this might be a sub-route or a modal, here we map it to the Editor */}
                <Route path="records/:type/:id/page_builder" element={<VisualEditor />} />

                {/* AI Integration */}
                <Route path="ai/settings" element={<AISettingsPage />} />
                <Route path="ai/approvals" element={<AIApprovalsPage />} />
                <Route path="ai/activities" element={<AIActivitiesPage />} />
                <Route path="ai/usage" element={<AIUsagePage />} />

                {/* Config Workspace Management */}
                <Route path="workspaces" element={<WorkspaceList />} />
                <Route path="workspaces/:id" element={<WorkspaceDetail />} />

                {/* Config Browser & Editor */}
                <Route path="config" element={<ConfigBrowser />} />
                <Route path="config/:type/:id" element={<ConfigDetailView />} />
                <Route path="config/:type/:id/versions" element={<ConfigDetailView />} />
              </Route>
            </Routes>
          </Suspense>
        </BrandProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
