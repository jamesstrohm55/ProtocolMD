import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const { t } = useTranslation()

  const FEATURES = [
    { to: '/protocols', titleKey: 'home.features.protocols.title', descKey: 'home.features.protocols.desc' },
    { to: '/drugs', titleKey: 'home.features.drugs.title', descKey: 'home.features.drugs.desc' },
    { to: '/dose', titleKey: 'home.features.dose.title', descKey: 'home.features.dose.desc' },
    { to: '/classes', titleKey: 'home.features.classes.title', descKey: 'home.features.classes.desc' }
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-clinical-900 mb-3">ProtocolMD</h1>
        <p className="text-lg text-gray-600">{t('home.subtitle')}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {FEATURES.map(f => (
          <Link key={f.to} to={f.to} className="border rounded-xl p-6 bg-white hover:shadow-md transition-shadow group">
            <h2 className="font-semibold text-gray-900 group-hover:text-clinical-700 mb-1">{t(f.titleKey)}</h2>
            <p className="text-sm text-gray-500">{t(f.descKey)}</p>
          </Link>
        ))}
      </div>
      <p className="text-xs text-center text-gray-400 mt-10">{t('home.disclaimer')}</p>
    </div>
  )
}
