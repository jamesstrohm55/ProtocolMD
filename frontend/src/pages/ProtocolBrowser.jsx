import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import ProtocolCard from '../components/ProtocolCard'

const TUMOR_SITES = ['All', 'Colorectal', 'Breast', 'Lung', 'Lymphoma']
const AUTHORITIES = ['All', 'NCCN', 'SBOC']

export default function ProtocolBrowser() {
  const { t } = useTranslation()
  const [tumorSite, setTumorSite] = useState('All')
  const [authority, setAuthority] = useState('All')

  const params = {}
  if (tumorSite !== 'All') params.tumorSite = tumorSite
  if (authority !== 'All') params.authority = authority

  const { data: protocols, isLoading, error } = useQuery({
    queryKey: ['protocols', params],
    queryFn: () => api.protocols.list(params)
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('protocols.title')}</h1>
      <div className="flex gap-4 mb-6 flex-wrap">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">{t('protocols.tumorSite')}</label>
          <select value={tumorSite} onChange={e => setTumorSite(e.target.value)} className="border rounded px-2 py-1 text-sm">
            {TUMOR_SITES.map(s => (
              <option key={s} value={s}>{s === 'All' ? t('common.all') : s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">{t('protocols.authority')}</label>
          <select value={authority} onChange={e => setAuthority(e.target.value)} className="border rounded px-2 py-1 text-sm">
            {AUTHORITIES.map(a => (
              <option key={a} value={a}>{a === 'All' ? t('common.all') : a}</option>
            ))}
          </select>
        </div>
      </div>
      {isLoading && <p className="text-gray-500">{t('protocols.loading')}</p>}
      {error && <p className="text-red-600">{t('protocols.loadError')}</p>}
      {protocols && (
        <div className="grid gap-3 sm:grid-cols-2">
          {protocols.map(p => <ProtocolCard key={p.id} protocol={p} />)}
          {protocols.length === 0 && <p className="text-gray-500">{t('protocols.noResults')}</p>}
        </div>
      )}
    </div>
  )
}
