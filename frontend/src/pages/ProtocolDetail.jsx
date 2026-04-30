import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'

export default function ProtocolDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { data: protocol, isLoading, error } = useQuery({
    queryKey: ['protocol', id],
    queryFn: () => api.protocols.get(id)
  })

  if (isLoading) return <p className="text-gray-500">{t('common.loading')}</p>
  if (error) return <p className="text-red-600">{t('protocols.notFound')}</p>
  if (!protocol) return null

  return (
    <div className="max-w-3xl">
      <Link to="/protocols" className="text-clinical-700 text-sm hover:underline">{t('protocols.backToProtocols')}</Link>
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{protocol.name}</h1>
        {protocol.authority.map(a => (
          <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">{a}</span>
        ))}
      </div>
      <p className="text-gray-500 mt-1">
        {protocol.tumorSite} · {t('protocols.cycleLength', { days: protocol.cycleLength })}
      </p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">{t('protocols.regimen')}</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2">{t('protocols.drug')}</th>
                <th className="text-left px-4 py-2">{t('protocols.dose')}</th>
                <th className="text-left px-4 py-2">{t('protocols.route')}</th>
                <th className="text-left px-4 py-2">{t('protocols.days')}</th>
              </tr>
            </thead>
            <tbody>
              {protocol.drugs.map((drug, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-2 font-medium">
                    <Link to={`/drugs/${drug.name.toLowerCase()}`} className="text-clinical-700 hover:underline">
                      {drug.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{drug.dose} {drug.unit}</td>
                  <td className="px-4 py-2">{drug.route}</td>
                  <td className="px-4 py-2">{t('protocols.day')} {drug.day.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {protocol.supportiveCare && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-1">{t('protocols.supportiveCare')}</h2>
          <p className="text-sm text-gray-700">{protocol.supportiveCare}</p>
        </section>
      )}
      {protocol.notes && (
        <section className="mt-4">
          <h2 className="text-lg font-semibold mb-1">{t('protocols.notes')}</h2>
          <p className="text-sm text-gray-700">{protocol.notes}</p>
        </section>
      )}

      <div className="mt-6">
        <Link
          to={`/dose?protocolId=${protocol.id}`}
          className="inline-block bg-clinical-700 text-white px-4 py-2 rounded hover:bg-clinical-900 text-sm"
        >
          {t('protocols.calcDose')}
        </Link>
      </div>
    </div>
  )
}
