import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Briefcase, Mail } from 'lucide-react'

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleHomeClick = () => {
    navigate('/')
  }

  const handleWorkClick = () => {
    if (location.pathname === '/') {
      // Already on home, scroll to projects
      document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Navigate to home
      navigate('/')
    }
  }

  const handleMailClick = () => {
    window.location.href = 'mailto:kai@example.com'
  }

  return (
    <div className="[font-synthesis:none] flex overflow-clip rounded-full items-center gap-2 p-1.5 justify-center [box-shadow:#00000005_0px_4px_8px] bg-white border border-solid border-[#F0F0F0] antialiased">
      <NavButton
        icon={<Home className="w-5 h-5" strokeWidth={1.5} />}
        onClick={handleHomeClick}
        isActive={location.pathname === '/'}
        label="Home"
      />
      <NavButton
        icon={<Briefcase className="w-5 h-5" strokeWidth={1.5} />}
        onClick={handleWorkClick}
        label="Work"
      />
      <NavButton
        icon={<Mail className="w-5 h-5" strokeWidth={1.5} />}
        onClick={handleMailClick}
        label="Mail"
      />
      <div className="w-[0.8px] h-6.5 rounded-full shrink-0 bg-[#DDDDDD]" />
      <div
        className="flex overflow-clip rounded-full flex-col items-center py-2.5 justify-center shrink-0 bg-origin-border bg-cover bg-position-[50%] [border-width:1.2px] border-solid border-[#EAEAEA] size-10"
        style={{
          backgroundImage:
            'url(https://app.paper.design/file-assets/01KWM3MAWXZNV08ENZMGME6W21/01KWMF0B5A2669H2Z3AZ8S9F8R.jpg)',
        }}
      />
    </div>
  )
}

export function NavButton({ icon, onClick, isActive = false, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        backgroundImage: isActive
          ? 'linear-gradient(in oklab 90deg, oklab(95.5% 0 0) -24.56%, oklab(97.5% 0 0) 113.82%)'
          : '',
      }}
      className={`w-10 h-10 flex justify-center items-center transition-all ${
        isActive
          ? 'bg-[#FAFAFA] rounded-full [box-shadow:#FFFFFF_-0.5px_1.2px_0px_inset] bg-origin-border [border-width:1.2px] border-solid border-[#EAEAEA]'
          : 'hover:bg-gray-50'
      }`}
    >
      {icon}
    </button>
  )
}