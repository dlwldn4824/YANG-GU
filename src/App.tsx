import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth'
import { JournalProvider } from './journal'
import { Layout } from './components/Layout'
import { IntroPage } from './pages/IntroPage'
import { BenefitsPage } from './pages/BenefitsPage'
import { MyCardPage } from './pages/MyCardPage'
import { FaqPage } from './pages/FaqPage'
import { LoginPage } from './pages/LoginPage'
import { PresentPage } from './pages/PresentPage'
import { NearbyPage } from './pages/NearbyPage'
import { FoodPage } from './pages/FoodPage'
import { PickIndexPage } from './pages/PickIndexPage'
import { PickPage } from './pages/PickPage'
import { FilmPage } from './pages/FilmPage'

export default function App() {
  return (
    <AuthProvider>
      <JournalProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<IntroPage />} />
              <Route path="/intro" element={<Navigate to="/" replace />} />
              <Route path="/pick" element={<PickIndexPage />} />
              <Route path="/pick/:id" element={<PickPage />} />
              <Route path="/comma" element={<Navigate to="/nearby" replace />} />
              <Route path="/benefits" element={<BenefitsPage />} />
              <Route path="/nearby" element={<NearbyPage />} />
              <Route path="/food" element={<FoodPage />} />
              <Route path="/issue" element={<Navigate to="/card" replace />} />
              <Route path="/card" element={<MyCardPage />} />
              <Route path="/yanggu" element={<FilmPage />} />
              <Route path="/film" element={<Navigate to="/yanggu" replace />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/present" element={<PresentPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </JournalProvider>
    </AuthProvider>
  )
}
