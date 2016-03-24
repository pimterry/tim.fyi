"use strict";

var express = require("express");
var readFile = require("fs-readfile-promise");
var components = require("server-components");

require("./components/item-feed/item-feed");
require("./components/manual-source");

var app = express();

app.get('/', function (req, res) {
    readFile("index.html").then((html) => {
        return components.render(html);
    }).then((output) => {
        res.send(output)
    }).catch((error) => {
        res.send("Panic, failed to render. " + error);
    });
});

app.listen(8080, () => console.log("Listening on 8080"));