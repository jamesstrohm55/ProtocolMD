const { fetchDrugLabel } = require('../src/services/openFDA');

global.fetch = jest.fn();
afterEach(() => jest.clearAllMocks());

describe('fetchDrugLabel', () => {
  it('returns parsed label fields for a valid drug', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        results: [{
          openfda: {
            generic_name: ['fluorouracil'],
            brand_name: ['Adrucil'],
            pharm_class_epc: ['Antimetabolite [EPC]']
          },
          description: ['Fluorouracil is a pyrimidine analog.'],
          dosage_and_administration: ['400 mg/m2 IV bolus Day 1.'],
          adverse_reactions: ['Nausea, myelosuppression, mucositis.'],
          contraindications: ['Bone marrow depression, poor nutritional status.'],
          warnings: ['Monitor CBC closely.']
        }]
      })
    });

    const result = await fetchDrugLabel('fluorouracil');
    expect(result.genericName).toBe('fluorouracil');
    expect(result.brandName).toBe('Adrucil');
    expect(result.pharmClass).toContain('Antimetabolite');
    expect(result.dosage).toBeTruthy();
    expect(result.adverseReactions).toBeTruthy();
  });

  it('returns null when drug is not found (404)', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const result = await fetchDrugLabel('notadrugxyz');
    expect(result).toBeNull();
  });
});
