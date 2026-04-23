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

// POST /add
// Expects { "friendUsername": "someUser" } in the request body.
// Adds a bidirectional friendship between the authenticated user and friendUsername.
router.post('/add', (req, res) => {
    const currentUser = req.user;
    const { friendUsername } = req.body;

    if (!currentUser || !currentUser.username) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!friendUsername) {
        return res.status(400).json({ message: 'friendUsername is required in the request body.' });
    }

    if (currentUser.username === friendUsername) {
        return res.status(400).json({ message: 'Cannot add yourself as a friend.' });
    }

    // For simplicity, we assume friendUsername is valid. In a real app, you'd check against a user list.
    
    ensureUserInMap(currentUser.username);
    ensureUserInMap(friendUsername);

    // Add friendship (bidirectional)
    friendsMap.get(currentUser.username).add(friendUsername);
    friendsMap.get(friendUsername).add(currentUser.username);

    res.status(200).json({
        message: `Successfully added ${friendUsername} as a friend to ${currentUser.username}.`,
        friends: Array.from(friendsMap.get(currentUser.username))
    });
});

// Optional: GET /list
// Returns the list of friends for the authenticated user.
router.get('/list', (req, res) => {
    const currentUser = req.user;

    if (!currentUser || !currentUser.username) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    const friends = friendsMap.get(currentUser.username) || new Set();
    res.status(200).json({
        username: currentUser.username,
        friends: Array.from(friends)
    });
});


module.exports = router;
