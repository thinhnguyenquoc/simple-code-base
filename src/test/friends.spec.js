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
        app.use('/friends', authMiddleware, friendsFeature.router);
    });

    beforeEach(() => {
        // Reset the in-memory state before each test
        friendsFeature.resetFriendsMap();
    });

    describe('POST /friends/add', () => {
        it('should add a friend successfully', async () => {
            const friendUsername = 'afriendUser';
            const response = await request(app)
                .post('/friends/add')
                .send({ friendUsername });

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('Successfully added');
            // For the add endpoint, it still returns all friends of the current user, not paginated
            expect(response.body.friends).toEqual([friendUsername]);
        });

        it('should return 400 if friendUsername is missing', async () => {
            const response = await request(app)
                .post('/friends/add')
                .send({}); // No friendUsername

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('friendUsername is required and must be a string in the request body.');
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
                .send({ friendUsername: 'apple' }); // Starts with 'a'

            // Add second friend
            const response = await request(app)
                .post('/friends/add')
                .send({ friendUsername: 'apricot' }); // Starts with 'a'

            expect(response.status).toBe(200);
            expect(response.body.friends).toEqual(expect.arrayContaining(['apple', 'apricot']));
            expect(response.body.friends.length).toBe(2);
        });

        it("should return 400 if friendUsername does not start with 'a'", async () => {
            const response = await request(app)
                .post('/friends/add')
                .send({ friendUsername: 'banana' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Friend username must start with the letter 'a'.");
        });
    });

    describe('POST /friends/remove', () => {
        it('should remove an existing friend successfully', async () => {
            // Add a friend first
            await request(app)
                .post('/friends/add')
                .send({ friendUsername: 'afriend' });

            // Remove the friend
            const response = await request(app)
                .post('/friends/remove')
                .send({ friendUsername: 'afriend' });

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('Successfully removed');
            expect(response.body.friends).toEqual([]);
        });

        it('should return 400 if friendUsername is missing', async () => {
            const response = await request(app)
                .post('/friends/remove')
                .send({}); // No friendUsername

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('friendUsername is required and must be a string in the request body.');
        });

        it('should return 400 if friend is not in the friends list', async () => {
            const response = await request(app)
                .post('/friends/remove')
                .send({ friendUsername: 'afriend' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Friend not found in your friends list.');
        });
    });

    describe('GET /friends/list with pagination', () => {
        // Helper to add multiple friends
        const addFriends = async (usernames) => {
            for (const username of usernames) {
                await request(app).post('/friends/add').send({ friendUsername: username });
            }
        };

        it('should return an empty list with pagination metadata if no friends are added', async () => {
            const response = await request(app)
                .get('/friends/list');

            expect(response.status).toBe(200);
            expect(response.body.username).toBe('testUser');
            expect(response.body.friends).toEqual([]);
            expect(response.body.pagination).toEqual({
                page: 1,
                limit: 10,
                totalFriends: 0,
                totalPages: 0,
            });
        });

        it('should return the first page with default limit after adding friends', async () => {
            await addFriends(['afriend1', 'afriend2', 'afriend3', 'afriend4', 'afriend5']);

            const response = await request(app)
                .get('/friends/list');

            expect(response.status).toBe(200);
            expect(response.body.username).toBe('testUser');
            expect(response.body.friends).toEqual(expect.arrayContaining(['afriend1', 'afriend2', 'afriend3', 'afriend4', 'afriend5']));
            expect(response.body.friends.length).toBe(5);
            expect(response.body.pagination).toEqual({
                page: 1,
                limit: 10,
                totalFriends: 5,
                totalPages: 1,
            });
        });

        it('should return the first page with a custom limit', async () => {
            await addFriends(['afriend1', 'afriend2', 'afriend3', 'afriend4', 'afriend5']);

            const response = await request(app)
                .get('/friends/list?limit=2');

            expect(response.status).toBe(200);
            expect(response.body.friends).toEqual(expect.arrayContaining(['afriend1', 'afriend2']));
            expect(response.body.friends.length).toBe(2);
            expect(response.body.pagination).toEqual({
                page: 1,
                limit: 2,
                totalFriends: 5,
                totalPages: 3,
            });
        });

        it('should return the second page with a custom limit', async () => {
            await addFriends(['afriend1', 'afriend2', 'afriend3', 'afriend4', 'afriend5']);

            const response = await request(app)
                .get('/friends/list?page=2&limit=2');

            expect(response.status).toBe(200);
            expect(response.body.friends).toEqual(expect.arrayContaining(['afriend3', 'afriend4']));
            expect(response.body.friends.length).toBe(2);
            expect(response.body.pagination).toEqual({
                page: 2,
                limit: 2,
                totalFriends: 5,
                totalPages: 3,
            });
        });

        it('should return the last page with remaining friends', async () => {
            await addFriends(['afriend1', 'afriend2', 'afriend3', 'afriend4', 'afriend5']);

            const response = await request(app)
                .get('/friends/list?page=3&limit=2');

            expect(response.status).toBe(200);
            expect(response.body.friends).toEqual(expect.arrayContaining(['afriend5']));
            expect(response.body.friends.length).toBe(1);
            expect(response.body.pagination).toEqual({
                page: 3,
                limit: 2,
                totalFriends: 5,
                totalPages: 3,
            });
        });

        it('should return an empty array for a page out of bounds', async () => {
            await addFriends(['afriend1', 'afriend2', 'afriend3']);

            const response = await request(app)
                .get('/friends/list?page=10&limit=2');

            expect(response.status).toBe(200);
            expect(response.body.friends).toEqual([]);
            expect(response.body.pagination).toEqual({
                page: 10,
                limit: 2,
                totalFriends: 3,
                totalPages: 2,
            });
        });
    });
});