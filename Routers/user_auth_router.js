const express = require("express");

const user_auth_router = express.Router();

const user_authentication = require('../controllers/users_authentication')

// <--------------------------------------------Routes for user-authentication------------------------>
user_auth_router.post('/signup', user_authentication.signup);
user_auth_router.post('/signin', user_authentication.signin);

module.exports = user_auth_router;