// app.js
const express = require('express');
const app = express();
const port = 3000;

const helloFeature = require('./src/features/hello');

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/hello', helloFeature);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

module.exports = app;
