import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function ProtocolDetail() {
  const { id } = useParams()
  const { data: protocol, isLoading, error } = useQuery({
    queryKey: ['protocol', id],
    queryFn: () => api.protocols.get(id)
  })

  if (isLoading) return <p className="text-gray-500">Loading...</p>
  if (error) return <p className="text-red-600">Protocol not found.</p>
  if (!protocol) return null

  return (
    <div className="max-w-3xl">
      <Link to="/protocols" className="text-clinical-700 text-sm hover:underline">← Back to Protocols</Link>
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{protocol.name}</h1>
        {protocol.authority.map(a => (
          <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">{a}</span>
        ))}
      </div>
      <p className="text-gray-500 mt-1">{protocol.tumorSite} · {protocol.cycleLength}-day cycle</p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Regimen</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2">Drug</th>
                <th className="text-left px-4 py-2">Dose</th>
                <th className="text-left px-4 py-2">Route</th>
                <th className="text-left px-4 py-2">Day(s)</th>
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
                  <td className="px-4 py-2">Day {drug.day.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {protocol.supportiveCare && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-1">Supportive Care</h2>
          <p className="text-sm text-gray-700">{protocol.supportiveCare}</p>
        </section>
      )}
      {protocol.notes && (
        <section className="mt-4">
          <h2 className="text-lg font-semibold mb-1">Notes</h2>
          <p className="text-sm text-gray-700">{protocol.notes}</p>
        </section>
      )}

      <div className="mt-6">
        <Link
          to={`/dose?protocolId=${protocol.id}`}
          className="inline-block bg-clinical-700 text-white px-4 py-2 rounded hover:bg-clinical-900 text-sm"
        >
          Calculate Dose for This Protocol →
        </Link>
      </div>
    </div>
  )
}
