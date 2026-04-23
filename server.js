// app.js
const express = require('express');
const app = express();
const port = 3000;

const helloFeature = require('./src/features/hello');
const authFeature = require('./src/features/auth');
const authMiddleware = require('./src/middleware/auth');
const friendsFeature = require('./src/features/friends'); // Added this line

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/auth', authFeature);
app.use('/hello', authMiddleware, helloFeature);
app.use('/friends', authMiddleware, friendsFeature.router);

if (require.main === module) {
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
}

module.exports = app;
