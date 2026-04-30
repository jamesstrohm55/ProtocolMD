import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
  const { data: drug, isLoading, error } = useQuery({
    queryKey: ['drug', name],
    queryFn: () => api.drugs.get(name)
  })

  if (isLoading) return <p className="text-gray-500">Loading drug data...</p>
  if (error) return <p className="text-red-600">Drug not found or data unavailable.</p>
  if (!drug) return null

  return (
    <div className="max-w-3xl">
      <Link to="/drugs" className="text-clinical-700 text-sm hover:underline">← Back to Drug Search</Link>
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
      <Section title="Definition">{drug.definition}</Section>
      <Section title="Description">{drug.description}</Section>
      <Section title="Dosing">{drug.dosage}</Section>
      <Section title="Adverse Reactions">{drug.adverseReactions}</Section>
      <Section title="Contraindications">{drug.contraindications}</Section>
      <Section title="Warnings">{drug.warnings}</Section>
    </div>
  )
}
