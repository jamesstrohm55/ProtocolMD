const OPENFDA_BASE = 'https://api.fda.gov/drug/label.json';

async function fetchDrugLabel(drugName) {
  const encoded = encodeURIComponent(`"${drugName}"`);
  const url = `${OPENFDA_BASE}?search=openfda.generic_name:${encoded}&limit=1`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;

  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;

  const label = data.results[0];
  const openfda = label.openfda || {};

  return {
    genericName: (openfda.generic_name?.[0] || drugName).toLowerCase(),
    brandName: openfda.brand_name?.[0] || null,
    pharmClass: openfda.pharm_class_epc?.[0] || null,
    description: label.description?.[0] || null,
    dosage: label.dosage_and_administration?.[0] || null,
    adverseReactions: label.adverse_reactions?.[0] || null,
    contraindications: label.contraindications?.[0] || null,
    warnings: label.warnings?.[0] || null
  };
}

module.exports = { fetchDrugLabel };
