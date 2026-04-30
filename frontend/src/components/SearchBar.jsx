import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function SearchBar({ placeholder, onSearch, defaultValue = '' }) {
  const { t } = useTranslation()
  const [value, setValue] = useState(defaultValue)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (!value.trim()) return
    if (onSearch) {
      onSearch(value.trim())
    } else {
      navigate(`/drugs?q=${encodeURIComponent(value.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder ?? t('common.searchPlaceholder')}
        className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinical-500"
      />
      <button type="submit" className="bg-clinical-700 text-white px-4 py-2 rounded text-sm hover:bg-clinical-900">
        {t('common.search')}
      </button>
    </form>
  )
}
