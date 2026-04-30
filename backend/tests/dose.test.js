const request = require('supertest');

describe('POST /api/dose/calculate', () => {
  let app;
  beforeAll(() => { app = require('../src/index'); });

  const base = {
    heightCm: 170,
    weightKg: 70,
    age: 50,
    sex: 'M',
    creatinineMgDl: 1.0,
    protocolId: 'folfox-nccn-crc'
  };

  it('returns BSA and calculated doses for FOLFOX', async () => {
    const res = await request(app).post('/api/dose/calculate').send(base);
    expect(res.status).toBe(200);
    expect(res.body.bsa).toBeCloseTo(1.818, 2);
    expect(Array.isArray(res.body.drugs)).toBe(true);
    const oxali = res.body.drugs.find(d => d.name === 'Oxaliplatin');
    expect(oxali.calculatedDoseMg).toBeCloseTo(154.5, 0);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/dose/calculate').send({ weightKg: 70 });
    expect(res.status).toBe(400);
  });

  it('calculates Carboplatin with Calvert formula', async () => {
    const res = await request(app)
      .post('/api/dose/calculate')
      .send({ ...base, protocolId: 'carbo-pacli-nccn-nsclc' });
    expect(res.status).toBe(200);
    const carbo = res.body.drugs.find(d => d.name === 'Carboplatin');
    expect(carbo.calculatedDoseMg).toBeGreaterThan(650);
    expect(carbo.note).toContain('Calvert');
  });

  it('applies vincristine cap in CHOP', async () => {
    const res = await request(app)
      .post('/api/dose/calculate')
      .send({ ...base, protocolId: 'chop-nccn-dlbcl' });
    expect(res.status).toBe(200);
    const vincristine = res.body.drugs.find(d => d.name === 'Vincristine');
    expect(vincristine.calculatedDoseMg).toBeLessThanOrEqual(2);
  });
});
