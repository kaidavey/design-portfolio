import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './App.css'
import Home from './pages/Home'
import CaseStudy from './pages/CaseStudy'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

export default App
