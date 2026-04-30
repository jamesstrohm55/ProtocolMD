import { Link } from 'react-router-dom'

const authorityColor = {
  NCCN: 'bg-blue-100 text-blue-800',
  SBOC: 'bg-green-100 text-green-800'
}

export default function ProtocolCard({ protocol }) {
  return (
    <Link
      to={`/protocols/${protocol.id}`}
      className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{protocol.name}</h3>
          <p className="text-sm text-gray-500">{protocol.tumorSite} · {protocol.cycleLength}-day cycle</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {protocol.authority.map(a => (
            <span key={a} className={`text-xs px-2 py-0.5 rounded-full font-medium ${authorityColor[a] || 'bg-gray-100 text-gray-700'}`}>
              {a}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
