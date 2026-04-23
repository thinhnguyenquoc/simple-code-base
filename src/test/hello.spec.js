const request = require('supertest');
const app = require('../../server');

describe('GET /hello', () => {
  it('should return 401 Unauthorized when no token is provided', async () => {
    const response = await request(app).get('/hello');
    expect(response.status).toBe(401);
  });
});
