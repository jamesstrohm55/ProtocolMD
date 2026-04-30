import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const links = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/protocols', labelKey: 'nav.protocols' },
  { to: '/drugs', labelKey: 'nav.drugs' },
  { to: '/dose', labelKey: 'nav.doseCalc' },
  { to: '/classes', labelKey: 'nav.drugClasses' }
]

export default function NavBar() {
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation()

  return (
    <nav className="bg-clinical-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="font-bold text-lg tracking-tight">ProtocolMD</Link>
        <div className="flex items-center gap-6 text-sm">
          {links.map(({ to, labelKey }) => (
            <Link
              key={to}
              to={to}
              className={`hover:text-clinical-300 transition-colors ${
                pathname === to ? 'text-clinical-300 font-semibold' : ''
              }`}
            >
              {t(labelKey)}
            </Link>
          ))}
          <select
            value={i18n.language}
            onChange={e => i18n.changeLanguage(e.target.value)}
            className="border border-clinical-700 bg-clinical-900 text-white rounded px-2 py-0.5 text-sm cursor-pointer hover:border-clinical-400 transition-colors"
          >
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="pt-BR">🇧🇷 Português</option>
          </select>
        </div>
      </div>
    </nav>
  )
}
