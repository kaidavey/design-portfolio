import { Routes, Route } from 'react-router-dom'
import './App.css'
import NavBar from './components/core/navbar'
import CaseStudy from './pages/CaseStudy'

function Home() {
  return (
    <div className="home-page">
      <div className="home-page__bg" aria-hidden="true" />
      <nav className="home-page__sidebar" aria-label="Site navigation">
        <NavBar />
      </nav>
      <main className="home-page__content">
        {/* Home content will go here */}
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/case-study/:slug" element={<CaseStudy />} />
    </Routes>
  )
}

export default App