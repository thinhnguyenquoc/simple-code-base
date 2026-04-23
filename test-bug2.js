const request = require('supertest');
const app = require('./server');

async function run() {
    // 1. register
    await request(app).post('/auth/register').send({ username: 'u1', password: 'p1' });
    // 2. login
    const loginRes = await request(app).post('/auth/login').send({ username: 'u1', password: 'p1' });
    const token = loginRes.body.token;
    
    // 3. add friend string
    const res1 = await request(app).post('/friends/add')
        .set('Authorization', `Bearer ${token}`)
        .send({ friendUsername: 123 });
    console.log("Response for number:", res1.status, res1.body);
    
    // 4. add actual friends
    await request(app).post('/friends/add').set('Authorization', `Bearer ${token}`).send({ friendUsername: 'afriend1' });
    await request(app).post('/friends/add').set('Authorization', `Bearer ${token}`).send({ friendUsername: 'afriend2' });
    
    // 5. check negative page
    const res2 = await request(app).get('/friends/list?page=-1')
        .set('Authorization', `Bearer ${token}`);
    console.log("Response for negative page:", res2.status, res2.body);
    
    process.exit(0);
}

run();
