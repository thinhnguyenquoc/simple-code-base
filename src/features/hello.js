const express = require('express');
const router = express.Router();

console.log('Hello feature loaded');

router.get('/', (req, res) => {
  console.log('[Hello] GET / request received');
  res.send('new hello');
});

module.exports = router;
