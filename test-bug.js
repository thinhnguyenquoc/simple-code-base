const app = require('./server');
const request = require('supertest');

jest.mock('./src/middleware/auth', () => (req, res, next) => {
    req.user = { username: 'testUser' };
    next();
});

async function run() {
    const res1 = await request(app).post('/friends/add').send({ friendUsername: 123 });
    console.log("Response for number:", res1.status, res1.body);
    
    await request(app).post('/friends/add').send({ friendUsername: 'afriend1' });
    await request(app).post('/friends/add').send({ friendUsername: 'afriend2' });
    
    const res2 = await request(app).get('/friends/list?page=-1');
    console.log("Response for negative page:", res2.status, res2.body);
}

run();
