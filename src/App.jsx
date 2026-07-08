import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import CaseStudy from './pages/CaseStudy'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/work/:slug" element={<CaseStudy />} />
    </Routes>
  )
}

export default App