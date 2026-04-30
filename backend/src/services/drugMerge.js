const { fetchDrugLabel } = require('./openFDA');
const { fetchNciDrug } = require('./nciDrugs');

async function getDrugDetail(drugName) {
  const [fda, nci] = await Promise.all([
    fetchDrugLabel(drugName),
    fetchNciDrug(drugName)
  ]);

  if (!fda && !nci) return null;

  return {
    genericName: fda?.genericName || drugName.toLowerCase(),
    brandName: fda?.brandName || null,
    pharmClass: fda?.pharmClass || null,
    synonyms: nci?.synonyms || [],
    definition: nci?.definition || null,
    nciId: nci?.nciId || null,
    description: fda?.description || null,
    dosage: fda?.dosage || null,
    adverseReactions: fda?.adverseReactions || null,
    contraindications: fda?.contraindications || null,
    warnings: fda?.warnings || null
  };
}

module.exports = { getDrugDetail };
