const request = require('supertest');
const app = require('./server');

async function run() {
    await request(app).post('/auth/register').send({ username: 'u2', password: 'p2' });
    const loginRes = await request(app).post('/auth/login').send({ username: 'u2', password: 'p2' });
    const token = loginRes.body.token;
    
    await request(app).post('/friends/add').set('Authorization', `Bearer ${token}`).send({ friendUsername: 'afriend1' });
    await request(app).post('/friends/add').set('Authorization', `Bearer ${token}`).send({ friendUsername: 'afriend2' });
    await request(app).post('/friends/add').set('Authorization', `Bearer ${token}`).send({ friendUsername: 'afriend3' });
    
    const res2 = await request(app).get('/friends/list?limit=-1')
        .set('Authorization', `Bearer ${token}`);
    console.log("Response for negative limit:", res2.status, res2.body);
    process.exit(0);
}

run();
