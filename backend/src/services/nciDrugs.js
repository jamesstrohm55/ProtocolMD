const NCI_BASE = 'https://clinicaltrialsapi.cancer.gov/api/v2/drugs';

async function fetchNciDrug(drugName) {
  const headers = {};
  if (process.env.NCI_API_KEY) headers['x-api-key'] = process.env.NCI_API_KEY;

  const url = `${NCI_BASE}?name=${encodeURIComponent(drugName)}&size=5`;
  const res = await fetch(url, { headers });

  if (!res.ok) return null;
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;

  const data = await res.json();
  if (!data.data || data.data.length === 0) return null;

  const match = data.data.find(
    d => d.name.toLowerCase() === drugName.toLowerCase()
  ) || data.data[0];

  return {
    name: match.name,
    synonyms: match.synonyms || [],
    definition: match.definition || null,
    nciId: match.nci_thesaurus_concept_id || null
  };
}

module.exports = { fetchNciDrug };
