var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', express.static("views/cachecheck.html"));

module.exports = router;
