const http = require('http')
const app = require("./app")
const port = process.env.PORT || 9000;
const server = http.createServer(app)
server.listen(port);

server.on('listening', () => {
    console.log("server is lisenting port " + port);
})

server.on('error', err => {
    console.log(err);
})