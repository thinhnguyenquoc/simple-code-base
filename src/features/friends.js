const express = require('express');
const router = express.Router();
const { User, Friendship } = require('../models');

console.log('Friends feature loaded');

// POST /add
// Expects { "friendUsername": "someUser" } in the request body.
// Adds a bidirectional friendship between the authenticated user and friendUsername.
router.post('/add', async (req, res) => {
    const currentUser = req.user;
    const { friendUsername } = req.body;
    console.log(`[Friends] POST /add request received. Current user: ${currentUser?.username}, Friend username: ${friendUsername}`);

    if (!currentUser || !currentUser.username) {
        console.warn('[Friends] Add friend failed: Authentication required.');
        return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!friendUsername || typeof friendUsername !== 'string') {
        console.warn('[Friends] Add friend failed: friendUsername is required and must be a string.');
        return res.status(400).json({ message: 'friendUsername is required and must be a string in the request body.' });
    }

    if (currentUser.username === friendUsername) {
        console.warn(`[Friends] Add friend failed: User '${currentUser.username}' cannot add themselves.`);
        return res.status(400).json({ message: 'Cannot add yourself as a friend.' });
    }

    try {
        const friend = await User.findOne({ where: { username: friendUsername } });
        if (!friend) {
            console.warn(`[Friends] Add friend failed: Friend username '${friendUsername}' does not exist.`);
            return res.status(400).json({ message: 'Friend username does not exist.' });
        }

        if (!friendUsername.toLowerCase().startsWith('a')) {
            console.warn(`[Friends] Add friend failed: Friend username '${friendUsername}' does not start with 'a'.`);
            return res.status(400).json({ message: 'Friend username must start with the letter \'a\'.' });
        }

        // Check if friendship already exists
        const existingFriendship1 = await Friendship.findOne({ where: { userId: currentUser.id, friendId: friend.id } });
        const existingFriendship2 = await Friendship.findOne({ where: { userId: friend.id, friendId: currentUser.id } });
        if (existingFriendship1 || existingFriendship2) {
            console.warn(`[Friends] Add friend failed: Friendship already exists between '${currentUser.username}' and '${friendUsername}'.`);
            return res.status(400).json({ message: 'Friendship already exists.' });
        }

        // Add bidirectional friendship
        await Friendship.create({ userId: currentUser.id, friendId: friend.id });
        await Friendship.create({ userId: friend.id, friendId: currentUser.id });

        console.log(`[Friends] Successfully added '${friendUsername}' as a friend to '${currentUser.username}'.`);
        res.status(200).json({
            message: `Successfully added ${friendUsername} as a friend to ${currentUser.username}.`
        });
    } catch (error) {
        console.error('[Friends] Error adding friend:', error.message);
        res.status(500).json({ message: 'Error adding friend' });
    }
});

// POST /remove
// Expects { "friendUsername": "someUser" } in the request body.
// Removes a bidirectional friendship between the authenticated user and friendUsername.
router.post('/remove', async (req, res) => {
    const currentUser = req.user;
    const { friendUsername } = req.body;
    console.log(`[Friends] POST /remove request received. Current user: ${currentUser?.username}, Friend username: ${friendUsername}`);

    if (!currentUser || !currentUser.username) {
        console.warn('[Friends] Remove friend failed: Authentication required.');
        return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!friendUsername || typeof friendUsername !== 'string') {
        console.warn('[Friends] Remove friend failed: friendUsername is required and must be a string.');
        return res.status(400).json({ message: 'friendUsername is required and must be a string in the request body.' });
    }

    try {
        const friend = await User.findOne({ where: { username: friendUsername } });
        if (!friend) {
            console.warn(`[Friends] Remove friend failed: Friend username '${friendUsername}' does not exist.`);
            return res.status(400).json({ message: 'Friend username does not exist.' });
        }

        // Remove bidirectional friendship
        await Friendship.destroy({ where: { userId: currentUser.id, friendId: friend.id } });
        await Friendship.destroy({ where: { userId: friend.id, friendId: currentUser.id } });

        console.log(`[Friends] Successfully removed '${friendUsername}' as a friend from '${currentUser.username}'.`);
        res.status(200).json({
            message: `Successfully removed ${friendUsername} as a friend.`
        });
    } catch (error) {
        console.error('[Friends] Error removing friend:', error.message);
        res.status(500).json({ message: 'Error removing friend' });
    }
});

// GET /list
// Returns a paginated list of friends for the authenticated user.
// Query parameters: page (default 1), limit (default 10)
router.get('/list', async (req, res) => {
    const currentUser = req.user;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    console.log(`[Friends] GET /list request received for user: ${currentUser?.username}, Page: ${page}, Limit: ${limit}`);

    if (!currentUser || !currentUser.username) {
        console.warn('[Friends] List friends failed: Authentication required.');
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        const friendships = await Friendship.findAll({
            where: { userId: currentUser.id },
            include: [{ model: User, as: 'friend', attributes: ['username'] }],
            limit,
            offset,
            order: [['friend', 'username', 'ASC']],
        });

        const friends = friendships.map(f => f.friend.username);
        const totalFriends = await Friendship.count({ where: { userId: currentUser.id } });
        const totalPages = Math.ceil(totalFriends / limit);

        console.log(`[Friends] Returning ${friends.length} friends (page ${page} of ${totalPages}) for user '${currentUser.username}'. Total friends: ${totalFriends}.`);
        res.status(200).json({
            username: currentUser.username,
            friends,
            pagination: {
                page,
                limit,
                totalFriends,
                totalPages,
            },
        });
    } catch (error) {
        console.error('[Friends] Error listing friends:', error.message);
        res.status(500).json({ message: 'Error listing friends' });
    }
});

// TODO: add friend of friend

module.exports = {
    router,
};
