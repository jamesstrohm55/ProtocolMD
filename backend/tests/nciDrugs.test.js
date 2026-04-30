const { fetchNciDrug } = require('../src/services/nciDrugs');

global.fetch = jest.fn();
afterEach(() => jest.clearAllMocks());

describe('fetchNciDrug', () => {
  it('returns parsed drug info for a valid drug', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{
          name: 'Fluorouracil',
          synonyms: ['5-FU', '5-Fluorouracil'],
          definition: 'A fluorinated pyrimidine analog with antineoplastic activity.',
          nci_thesaurus_concept_id: 'C505'
        }]
      })
    });

    const result = await fetchNciDrug('fluorouracil');
    expect(result.name).toBe('Fluorouracil');
    expect(result.synonyms).toContain('5-FU');
    expect(result.definition).toBeTruthy();
    expect(result.nciId).toBe('C505');
  });

  it('returns null when no results', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] })
    });
    const result = await fetchNciDrug('notadrugxyz');
    expect(result).toBeNull();
  });
});
