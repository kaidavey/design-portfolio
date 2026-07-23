import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig, LazyMotion, domMax } from 'motion/react'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domMax} strict>
          <App />
        </LazyMotion>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)
