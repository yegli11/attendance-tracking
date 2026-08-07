import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/presentation/context/AuthContext'
import { ActiveEventProvider } from '@/presentation/context/ActiveEventContext'
import { RequireAuth } from '@/presentation/components/templates/RequireAuth'
import { PageLayout } from '@/presentation/components/templates/PageLayout'
import { EventsPage } from '@/presentation/components/pages/EventsPage'
import { LoginPage } from '@/presentation/components/pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ActiveEventProvider>
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
          </Routes>
        </ActiveEventProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
