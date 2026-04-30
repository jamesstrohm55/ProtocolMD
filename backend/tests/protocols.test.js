const request = require('supertest');

describe('Protocols API', () => {
  let app;
  beforeAll(() => { app = require('../src/index'); });

  it('GET /api/protocols returns array of protocols', async () => {
    const res = await request(app).get('/api/protocols');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/protocols?tumorSite=Colorectal filters results', async () => {
    const res = await request(app).get('/api/protocols?tumorSite=Colorectal');
    expect(res.status).toBe(200);
    res.body.forEach(p => expect(p.tumorSite).toBe('Colorectal'));
  });

  it('GET /api/protocols/:id returns single protocol', async () => {
    const res = await request(app).get('/api/protocols/folfox-nccn-crc');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('folfox-nccn-crc');
    expect(Array.isArray(res.body.drugs)).toBe(true);
  });

  it('GET /api/protocols/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/protocols/does-not-exist');
    expect(res.status).toBe(404);
  });
});
