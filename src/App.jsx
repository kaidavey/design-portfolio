import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import CaseStudy from './pages/CaseStudy'
import DebugMux from './pages/DebugMux'
import TestSanity from './pages/TestSanity'
import TestMuxVideo from './pages/TestMuxVideo'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/work/:slug" element={<CaseStudy />} />
      <Route path="/debug-mux" element={<DebugMux />} />
      <Route path="/test-sanity" element={<TestSanity />} />
      <Route path="/test-mux-video" element={<TestMuxVideo />} />
    </Routes>
  )
}

export default App