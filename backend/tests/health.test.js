const request = require('supertest');

describe('GET /api/health', () => {
  let app;
  beforeAll(() => { app = require('../src/index'); });

  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
