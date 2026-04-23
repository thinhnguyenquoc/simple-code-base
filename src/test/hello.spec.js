const request = require('supertest');
const app = require('../../server');

describe('GET /hello', () => {
  it('should return 200 OK and "hello"', async () => {
    const response = await request(app).get('/hello');
    expect(response.status).toBe(200);
    expect(response.text).toBe('hello');
  });
});
