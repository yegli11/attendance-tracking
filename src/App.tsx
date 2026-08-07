import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/presentation/context/AuthContext'
import { RequireAuth } from '@/presentation/components/templates/RequireAuth'
import { PageLayout } from '@/presentation/components/templates/PageLayout'
import { HomePage } from '@/presentation/components/pages/HomePage'
import { LoginPage } from '@/presentation/components/pages/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <PageLayout>
                  <HomePage />
                </PageLayout>
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
