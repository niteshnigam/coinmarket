const express = require("express");

const router_pwd = express.Router();


const user_authentication = require('../controllers/users_authentication')

const checkauth = require('../middlewares/middleware')


router_pwd.get('/verify/:token', user_authentication.verifytoken);
router_pwd.put('/forgotpassword', user_authentication.forgotpassword)
router_pwd.put('/changepassword/:token', user_authentication.changepassword)
router_pwd.put('/resetpassword', checkauth, user_authentication.resetpassword)

module.exports = router_pwd;