import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import SearchBar from '../components/SearchBar'

export default function DrugSearch() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [query, setQuery] = useState(q)

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['drugs', 'search', query],
    queryFn: () => api.drugs.search(query),
    enabled: query.length > 1
  })

  function handleSearch(term) {
    setQuery(term)
    setSearchParams({ q: term })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('drugs.searchTitle')}</h1>
      <div className="max-w-xl mb-6">
        <SearchBar placeholder={t('drugs.searchPlaceholder')} defaultValue={q} onSearch={handleSearch} />
      </div>
      {isLoading && <p className="text-gray-500">{t('drugs.searching')}</p>}
      {error && <p className="text-red-600">{t('drugs.searchError')}</p>}
      {results && results.length === 0 && query && (
        <p className="text-gray-500">{t('drugs.noResults', { query })}</p>
      )}
      {results && results.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map(drug => (
            <Link
              key={drug.genericName}
              to={`/drugs/${drug.genericName}`}
              className="block border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <p className="font-semibold capitalize">{drug.genericName}</p>
              {drug.brandName && <p className="text-sm text-gray-500">{drug.brandName}</p>}
              {drug.pharmClass && <p className="text-xs text-gray-400 mt-1">{drug.pharmClass}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
