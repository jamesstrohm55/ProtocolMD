import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'

function Section({ title, children }) {
  if (!children) return null
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{children}</p>
    </section>
  )
}

export default function DrugDetail() {
  const { name } = useParams()
  const { t } = useTranslation()
  const { data: drug, isLoading, error } = useQuery({
    queryKey: ['drug', name],
    queryFn: () => api.drugs.get(name)
  })

  if (isLoading) return <p className="text-gray-500">{t('drugs.loading')}</p>
  if (error) return <p className="text-red-600">{t('drugs.notFound')}</p>
  if (!drug) return null

  return (
    <div className="max-w-3xl">
      <Link to="/drugs" className="text-clinical-700 text-sm hover:underline">{t('drugs.backToSearch')}</Link>
      <div className="mt-4">
        <h1 className="text-2xl font-bold capitalize">{drug.genericName}</h1>
        {drug.brandName && <p className="text-gray-500">{drug.brandName}</p>}
        <div className="flex gap-2 mt-2 flex-wrap">
          {drug.pharmClass && (
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">{drug.pharmClass}</span>
          )}
          {drug.synonyms?.map(s => (
            <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
          ))}
        </div>
      </div>
      <Section title={t('drugs.definition')}>{drug.definition}</Section>
      <Section title={t('drugs.description')}>{drug.description}</Section>
      <Section title={t('drugs.dosing')}>{drug.dosage}</Section>
      <Section title={t('drugs.adverseReactions')}>{drug.adverseReactions}</Section>
      <Section title={t('drugs.contraindications')}>{drug.contraindications}</Section>
      <Section title={t('drugs.warnings')}>{drug.warnings}</Section>
    </div>
  )
}
