const express = require("express");

const coinmarketcap_api_router = express.Router();

const coinmarketcap_api = require('../controllers/coinmarket_api_controller')

const checkauth = require('../middlewares/middleware')


function getResult(req, res) {
    console.log(req);

    coinmarketcap_api.get()
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json(err);
        })
}

coinmarketcap_api_router.get('/getdata', checkauth, getResult)
module.exports = coinmarketcap_api_router;