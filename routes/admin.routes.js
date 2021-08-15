const router = require('express').Router();
const {list} = require('../controller/user.controller');

router.get('/list', list)

module.exports = router