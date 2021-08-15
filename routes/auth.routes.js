const router = require('express').Router();
const { addUser, login} = require('../controller/user.controller') 


router.post('/register', addUser);
router.post('/login', login);

module.exports = router

