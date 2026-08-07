import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PageLayout } from '@/presentation/components/templates/PageLayout'
import { HomePage } from '@/presentation/components/pages/HomePage'

function App() {
  return (
    <BrowserRouter>
      <PageLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </PageLayout>
    </BrowserRouter>
  )
}

export default App
