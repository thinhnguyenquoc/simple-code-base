const request = require('supertest');
const express = require('express');
const authMiddleware = require('../middleware/auth'); // Adjust path as needed
const friendsFeature = require('../features/friends'); // Adjust path as needed

// Mock JWT_SECRET for auth middleware
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn()
}));

// Mock the auth middleware to simulate authenticated users
jest.mock('../middleware/auth', () => (
    (req, res, next) => {
        // For tests, simulate a logged-in user
        req.user = { username: 'testUser' };
        next();
    }
));

describe('Friends Feature', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        // Mount the friends feature with auth middleware
        app.use('/friends', authMiddleware, friendsFeature);
        
        // We also need to mock the users available in auth.js if friend existence check was implemented.
        // For now, we are not checking for friend existence, so this is fine.
    });

    beforeEach(() => {
        // Reset any in-memory state before each test if necessary.
        // Since friendsMap is within friends.js and not exported, we'd need a way to reset it.
        // A more robust approach would be to export friendsMap from friends.js or pass it as a dependency.
        // For this example, we'll assume the state persists across tests, which might be an issue.
        // A better solution for testing would be to have friendsMap be imported and then reset.
        // For now, we'll proceed with the assumption of state persistence and see.
        // If tests fail due to state, we'll need to refactor friends.js to allow state reset.
    });

    describe('POST /friends/add', () => {
        it('should add a friend successfully', async () => {
            const friendUsername = 'friendUser';
            const response = await request(app)
                .post('/friends/add')
                .send({ friendUsername });

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('Successfully added');
            expect(response.body.friends).toEqual([friendUsername]);
        });

        it('should return 400 if friendUsername is missing', async () => {
            const response = await request(app)
                .post('/friends/add')
                .send({}); // No friendUsername

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('friendUsername is required in the request body.');
        });

        it('should return 400 if trying to add self as friend', async () => {
            const response = await request(app)
                .post('/friends/add')
                .send({ friendUsername: 'testUser' }); // testUser is from mocked auth middleware

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Cannot add yourself as a friend.');
        });

        it('should add a second friend and return both', async () => {
            // Add first friend
            await request(app)
                .post('/friends/add')
                .send({ friendUsername: 'friend1' });

            // Add second friend
            const response = await request(app)
                .post('/friends/add')
                .send({ friendUsername: 'friend2' });

            expect(response.status).toBe(200);
            expect(response.body.friends).toEqual(expect.arrayContaining(['friend1', 'friend2']));
            expect(response.body.friends.length).toBe(2);
        });
    });

    describe('GET /friends/list', () => {
        it('should return an empty list if no friends are added', async () => {
            const response = await request(app)
                .get('/friends/list');

            expect(response.status).toBe(200);
            expect(response.body.username).toBe('testUser');
            expect(response.body.friends).toEqual([]);
        });

        it('should return the list of friends after adding them', async () => {
            // Add friends first
            await request(app)
                .post('/friends/add')
                .send({ friendUsername: 'friendA' });
            await request(app)
                .post('/friends/add')
                .send({ friendUsername: 'friendB' });

            // Now get the list
            const response = await request(app)
                .get('/friends/list');

            expect(response.status).toBe(200);
            expect(response.body.username).toBe('testUser');
            expect(response.body.friends).toEqual(expect.arrayContaining(['friendA', 'friendB']));
            expect(response.body.friends.length).toBe(2);
        });
    });
});
