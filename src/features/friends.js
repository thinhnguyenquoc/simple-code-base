const express = require('express');
const router = express.Router();

// In-memory store for friendships. Maps username to a Set of friend usernames.
const friendsMap = new Map();

// Helper to ensure a user exists in the friendsMap, initializing with an empty Set if not.
const ensureUserInMap = (username) => {
    if (!friendsMap.has(username)) {
        friendsMap.set(username, new Set());
    }
};

console.log('Friends feature loaded');

// POST /add
// Expects { "friendUsername": "someUser" } in the request body.
// Adds a bidirectional friendship between the authenticated user and friendUsername.
router.post('/add', (req, res) => {
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

    // For simplicity, we assume friendUsername is valid. In a real app, you'd check against a user list.

    if (!friendUsername.toLowerCase().startsWith('a')) {
        console.warn(`[Friends] Add friend failed: Friend username '${friendUsername}' does not start with 'a'.`);
        return res.status(400).json({ message: 'Friend username must start with the letter \'a\'.' });
    }

    ensureUserInMap(currentUser.username);
    ensureUserInMap(friendUsername);

    // Add friendship (bidirectional)
    friendsMap.get(currentUser.username).add(friendUsername);
    friendsMap.get(friendUsername).add(currentUser.username);

    console.log(`[Friends] Successfully added '${friendUsername}' as a friend to '${currentUser.username}'.`);
    res.status(200).json({
        message: `Successfully added ${friendUsername} as a friend to ${currentUser.username}.`,
        friends: Array.from(friendsMap.get(currentUser.username))
    });
});

// POST /remove
// Expects { "friendUsername": "someUser" } in the request body.
// Removes a bidirectional friendship between the authenticated user and friendUsername.
router.post('/remove', (req, res) => {
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

    const userFriends = friendsMap.get(currentUser.username);
    
    if (!userFriends || !userFriends.has(friendUsername)) {
        console.warn(`[Friends] Remove friend failed: '${friendUsername}' is not in '${currentUser.username}'s friends list.`);
        return res.status(400).json({ message: 'Friend not found in your friends list.' });
    }

    // Remove friendship (bidirectional)
    userFriends.delete(friendUsername);
    if (friendsMap.has(friendUsername)) {
        friendsMap.get(friendUsername).delete(currentUser.username);
    }

    console.log(`[Friends] Successfully removed '${friendUsername}' as a friend from '${currentUser.username}'.`);
    res.status(200).json({
        message: `Successfully removed ${friendUsername} as a friend.`,
        friends: Array.from(userFriends)
    });
});

// Optional: GET /list
// Returns a paginated list of friends for the authenticated user.
// Query parameters: page (default 1), limit (default 10)
router.get('/list', (req, res) => {
    const currentUser = req.user;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    console.log(`[Friends] GET /list request received for user: ${currentUser?.username}, Page: ${page}, Limit: ${limit}`);

    if (!currentUser || !currentUser.username) {
        console.warn('[Friends] List friends failed: Authentication required.');
        return res.status(401).json({ message: 'Authentication required.' });
    }

    const allFriends = Array.from(friendsMap.get(currentUser.username) || new Set());
    
    // Sort friends by the last character of their username
    allFriends.sort((a, b) => {
        const lastCharA = a.charAt(a.length - 1);
        const lastCharB = b.charAt(b.length - 1);
        return lastCharA.localeCompare(lastCharB);
    });

    const totalFriends = allFriends.length;
    const paginatedFriends = allFriends.slice(offset, offset + limit);
    const totalPages = Math.ceil(totalFriends / limit);

    console.log(`[Friends] Returning ${paginatedFriends.length} friends (page ${page} of ${totalPages}) for user '${currentUser.username}'. Total friends: ${totalFriends}.`);
    res.status(200).json({
        username: currentUser.username,
        friends: paginatedFriends,
        pagination: {
            page,
            limit,
            totalFriends,
            totalPages,
        },
    });
});


module.exports = {
    router,
    resetFriendsMap: () => {
        friendsMap.clear();
    }
};
