const request = require('supertest');

jest.mock('../src/services/openFDA', () => ({
  fetchDrugLabel: jest.fn().mockResolvedValue({
    genericName: 'fluorouracil',
    brandName: 'Adrucil',
    pharmClass: 'Antimetabolite [EPC]',
    description: 'A pyrimidine analog.',
    dosage: 'Administer 400 mg/m2 IV.',
    adverseReactions: 'Nausea, myelosuppression.',
    contraindications: 'Bone marrow depression.',
    warnings: 'Monitor CBC.'
  })
}));

describe('Drugs API', () => {
  let app;
  beforeAll(() => { app = require('../src/index'); });

  it('GET /api/drugs/search?q=fluorouracil returns results', async () => {
    const res = await request(app).get('/api/drugs/search?q=fluorouracil');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].genericName).toBe('fluorouracil');
  });

  it('GET /api/drugs/search without q returns 400', async () => {
    const res = await request(app).get('/api/drugs/search');
    expect(res.status).toBe(400);
  });

  it('GET /api/drugs/:name returns drug detail', async () => {
    const res = await request(app).get('/api/drugs/fluorouracil');
    expect(res.status).toBe(200);
    expect(res.body.genericName).toBe('fluorouracil');
    expect(res.body.pharmClass).toBeTruthy();
    expect(res.body.dosage).toBeTruthy();
    expect(res.body.adverseReactions).toBeTruthy();
  });
});
