const request = require('supertest');
const app = require('../../server');

describe('Bug Hunt', () => {
    it('test number as username', async () => {
        const response = await request(app)
            .post('/friends/add')
            .send({ friendUsername: 123 });
        console.log(response.status, response.body);
    });
    
    it('test negative page', async () => {
        await request(app).post('/friends/add').send({ friendUsername: 'afriend1' });
        await request(app).post('/friends/add').send({ friendUsername: 'afriend2' });
        const response = await request(app).get('/friends/list?page=-1');
        console.log(response.status, response.body);
    });
});
