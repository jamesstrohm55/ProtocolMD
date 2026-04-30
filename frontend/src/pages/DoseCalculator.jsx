import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'

export default function DoseCalculator() {
  const { t } = useTranslation()
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

  const fields = useMemo(() => [
    { label: t('dose.height'), name: 'heightCm', placeholder: '170' },
    { label: t('dose.weight'), name: 'weightKg', placeholder: '70' },
    { label: t('dose.age'), name: 'age', placeholder: '50' },
    { label: t('dose.creatinine'), name: 'creatinineMgDl', placeholder: '1.0', step: '0.1' }
  ], [t])

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t('dose.title')}</h1>
      <form onSubmit={e => { e.preventDefault(); calculate() }} className="space-y-4 bg-white border rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          {fields.map(({ label, name, placeholder, step }) => (
            <label key={name} className="block">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <input type="number" name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} step={step}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm" />
            </label>
          ))}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t('dose.sex')}</span>
            <select name="sex" value={form.sex} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2 text-sm">
              <option value="M">{t('dose.male')}</option>
              <option value="F">{t('dose.female')}</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t('dose.protocol')}</span>
            <select name="protocolId" value={form.protocolId} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2 text-sm">
              <option value="">{t('dose.selectProtocol')}</option>
              {protocols?.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.tumorSite})</option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" disabled={!isComplete || isPending}
          className="w-full bg-clinical-700 text-white py-2 rounded hover:bg-clinical-900 disabled:opacity-50 text-sm font-medium">
          {isPending ? t('dose.calculating') : t('dose.calculateDoses')}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600 text-sm">{t('dose.calcError')}</p>}

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
                  <th className="text-left px-4 py-2">{t('protocols.drug')}</th>
                  <th className="text-left px-4 py-2">{t('dose.prescribed')}</th>
                  <th className="text-left px-4 py-2">{t('dose.calculated')}</th>
                  <th className="text-left px-4 py-2">{t('dose.note')}</th>
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
          <p className="text-xs text-gray-400 mt-3">{t('dose.disclaimer')}</p>
        </div>
      )}
    </div>
  )
}
