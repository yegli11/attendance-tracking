import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/presentation/context/AuthContext'
import { ToastProvider } from '@/presentation/context/ToastContext'
import { RequireAuth } from '@/presentation/components/templates/RequireAuth'
import { PageLayout } from '@/presentation/components/templates/PageLayout'
import { EventsPage } from '@/presentation/components/pages/EventsPage'
import { EventWorkspacePage } from '@/presentation/components/pages/EventWorkspacePage'
import { LoginPage } from '@/presentation/components/pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <PageLayout>
                    <EventsPage />
                  </PageLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/events/:eventId"
              element={
                <RequireAuth>
                  <PageLayout>
                    <EventWorkspacePage />
                  </PageLayout>
                </RequireAuth>
              }
            />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
