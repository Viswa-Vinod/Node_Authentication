const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const router = require("./router");
const mongoose = require("mongoose");

//DB Setup

mongoose.connect('mongodb://127.0.0.1:auth/auth');
//app setup
const app = express(); //initialize an express app


//express app middleware
app.use(morgan("combined")); //set up request logging
app.use(bodyParser.json("application/json")); //app will parse any incoming request as json
router(app); //ensure router gets app so that requests to routes get handled

//server setup
const port = process.env.PORT || 3090;
const server = http.createServer(app); //instruct http to forward all requests to the express app
server.listen(port);
console.log("server listening on ", port);
