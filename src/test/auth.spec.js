const request = require('supertest');
const app = require('../../server');

describe('Authentication Flow', () => {
  const testUser = {
    username: 'testuser',
    password: 'password123'
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send(testUser);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should not register the same user twice', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send(testUser);
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  it('should login and return a token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send(testUser);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    return res.body.token;
  });

  it('should fail login with wrong credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' });
    
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should fail to access protected /hello without token', async () => {
    const res = await request(app).get('/hello');
    expect(res.statusCode).toEqual(401);
  });

  it('should access protected /hello with a valid token', async () => {
    // First login to get token
    const loginRes = await request(app)
      .post('/auth/login')
      .send(testUser);
    
    const token = loginRes.body.token;

    const res = await request(app)
      .get('/hello')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('hello');
  });
});
