const { fetchDrugLabel } = require('./openFDA');

async function getDrugDetail(drugName) {
  const fda = await fetchDrugLabel(drugName).catch(() => null);
  if (!fda) return null;

  return {
    genericName: fda.genericName,
    brandName: fda.brandName,
    pharmClass: fda.pharmClass,
    description: fda.description,
    dosage: fda.dosage,
    adverseReactions: fda.adverseReactions,
    contraindications: fda.contraindications,
    warnings: fda.warnings
  };
}

module.exports = { getDrugDetail };
