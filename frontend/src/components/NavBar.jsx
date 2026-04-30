import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/protocols', label: 'Protocols' },
  { to: '/drugs', label: 'Drugs' },
  { to: '/dose', label: 'Dose Calc' },
  { to: '/classes', label: 'Drug Classes' }
]

export default function NavBar() {
  const { pathname } = useLocation()
  return (
    <nav className="bg-clinical-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="font-bold text-lg tracking-tight">ProtocolMD</Link>
        <div className="flex gap-6 text-sm">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`hover:text-clinical-300 transition-colors ${
                pathname === to ? 'text-clinical-300 font-semibold' : ''
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
