import { Link } from 'react-router-dom'

const FEATURES = [
  { to: '/protocols', title: 'Protocol Browser', desc: 'Browse SBOC and NCCN preferential regimens by tumor site.' },
  { to: '/drugs', title: 'Drug Reference', desc: 'Search chemotherapy, immunotherapy, and targeted drugs by name.' },
  { to: '/dose', title: 'Dose Calculator', desc: 'Calculate BSA-based and AUC-based doses from patient parameters.' },
  { to: '/classes', title: 'Drug Classes', desc: 'Explore by class: alkylating agents, checkpoint inhibitors, TKIs, and more.' }
]

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-clinical-900 mb-3">ProtocolMD</h1>
        <p className="text-lg text-gray-600">
          Oncology protocol reference and dose calculation for clinicians.
          SBOC and NCCN guidelines in one place.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {FEATURES.map(f => (
          <Link key={f.to} to={f.to} className="border rounded-xl p-6 bg-white hover:shadow-md transition-shadow group">
            <h2 className="font-semibold text-gray-900 group-hover:text-clinical-700 mb-1">{f.title}</h2>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </Link>
        ))}
      </div>
      <p className="text-xs text-center text-gray-400 mt-10">
        For clinical reference only. All treatment decisions must be made by licensed healthcare providers.
      </p>
    </div>
  )
}
