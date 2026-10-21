import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Sidebar } from './components/Sidebar'
import { Ticker } from './components/Ticker'
import { PlasticProvider } from './context/PlasticProvider'
import { LanguageProvider } from './i18n/LanguageContext'
import { AboutPage } from './pages/AboutPage'
import { CalculatorPage } from './pages/CalculatorPage'
import { ChallengePage } from './pages/ChallengePage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OceanPage } from './pages/OceanPage'
import { ProblemPage } from './pages/ProblemPage'
import { SolutionPage } from './pages/SolutionPage'
import { SwapPage } from './pages/SwapPage'

const MapPage = lazy(() => import('./pages/MapPage').then((module) => ({ default: module.MapPage })))

/** Every page opens at its top, so a route change starts there. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function AppShell() {
  return (
    <div className="min-h-screen bg-black text-white">
      <ScrollToTop />
      <Sidebar />
      <div className="pt-14 lg:pl-[var(--sidebar-offset)] lg:pt-0">
        <Ticker />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/problem" element={<ProblemPage />} />
            <Route path="/solution" element={<SolutionPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/swap" element={<SwapPage />} />
            <Route path="/ocean" element={<OceanPage />} />
            <Route path="/challenge" element={<ChallengePage />} />
            <Route
              path="/map"
              element={
                <Suspense fallback={<div className="h-screen" />}>
                  <MapPage />
                </Suspense>
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <PlasticProvider>
        <AppShell />
      </PlasticProvider>
    </LanguageProvider>
  )
}

export default App
