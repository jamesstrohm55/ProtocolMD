import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function DoseCalculator() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    heightCm: '',
    weightKg: '',
    age: '',
    sex: 'M',
    creatinineMgDl: '',
    protocolId: searchParams.get('protocolId') || ''
  })

  const { data: protocols } = useQuery({
    queryKey: ['protocols'],
    queryFn: () => api.protocols.list()
  })

  const { mutate: calculate, data: result, isPending, error } = useMutation({
    mutationFn: () => api.dose.calculate({
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      age: Number(form.age),
      sex: form.sex,
      creatinineMgDl: Number(form.creatinineMgDl),
      protocolId: form.protocolId
    })
  })

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const isComplete = form.heightCm && form.weightKg && form.age && form.creatinineMgDl && form.protocolId

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Dose Calculator</h1>
      <form onSubmit={e => { e.preventDefault(); calculate() }} className="space-y-4 bg-white border rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Height (cm)', name: 'heightCm', placeholder: '170' },
            { label: 'Weight (kg)', name: 'weightKg', placeholder: '70' },
            { label: 'Age', name: 'age', placeholder: '50' },
            { label: 'Creatinine (mg/dL)', name: 'creatinineMgDl', placeholder: '1.0', step: '0.1' }
          ].map(({ label, name, placeholder, step }) => (
            <label key={name} className="block">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <input type="number" name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} step={step}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm" />
            </label>
          ))}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Sex</span>
            <select name="sex" value={form.sex} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2 text-sm">
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Protocol</span>
            <select name="protocolId" value={form.protocolId} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2 text-sm">
              <option value="">Select protocol...</option>
              {protocols?.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.tumorSite})</option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" disabled={!isComplete || isPending}
          className="w-full bg-clinical-700 text-white py-2 rounded hover:bg-clinical-900 disabled:opacity-50 text-sm font-medium">
          {isPending ? 'Calculating...' : 'Calculate Doses'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600 text-sm">Calculation failed. Check all fields.</p>}

      {result && (
        <div className="mt-6 bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-1">{result.protocolName}</h2>
          <div className="flex gap-6 text-sm text-gray-600 mb-4">
            <span>BSA: <strong>{result.bsa} m²</strong></span>
            <span>CrCl: <strong>{result.crCl} mL/min</strong></span>
          </div>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-2">Drug</th>
                  <th className="text-left px-4 py-2">Prescribed</th>
                  <th className="text-left px-4 py-2">Calculated</th>
                  <th className="text-left px-4 py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {result.drugs.map((drug, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{drug.name}</td>
                    <td className="px-4 py-2">{drug.prescribedDose} {drug.unit}</td>
                    <td className="px-4 py-2 font-semibold text-clinical-900">{drug.calculatedDoseMg} mg</td>
                    <td className="px-4 py-2 text-xs text-gray-500">{drug.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            For reference only. All doses must be verified by a licensed oncologist before administration.
          </p>
        </div>
      )}
    </div>
  )
}
