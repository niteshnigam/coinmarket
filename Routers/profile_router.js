const express = require("express");

const profile_router = express.Router();


const userprofile = require('../controllers/userProfile')

const checkauth = require('../middlewares/middleware')



profile_router.put('/update', checkauth, userprofile.updateprofile)
profile_router.post('/create', checkauth, userprofile.createprofile)
profile_router.get('/get', checkauth, userprofile.getprofile)
profile_router.delete('/delete', checkauth, userprofile.deleteprofile)

module.exports = profile_router;