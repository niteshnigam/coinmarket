const express = require("express");

const bodyparser = require("body-parser")

const User_auth_routes = require("./Routers/user_auth_router")
const router_pwd_routes = require("./Routers/pwd_router")
const profile_routes = require("./Routers/profile_router")
const coinmarketcap_routes = require("./Routers/coinmarket_router")

const app = express();

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());


app.use('/user', User_auth_routes);
app.use('/user/#', router_pwd_routes);
app.use('/user/profile', profile_routes);
app.use('/user/coinmarket', coinmarketcap_routes)


module.exports = app;