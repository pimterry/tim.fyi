"use strict";

require("dotenv").config();
require('newrelic');

var express = require("express");
var readFile = require("fs-readfile-promise");
var components = require("server-components");

require("./components/item-feed/item-feed");
require("./components/item-carousel/item-carousel");
require("./components/manual-source");
require("./components/twitter-source");
require("./components/github-source");
require("./components/rss-source");
require("./components/oembed-item-wrapper");
require("./components/social-media-icons");

var app = express();

app.use(express.static('static'));

app.get('/', function (req, res) {
    readFile("index.html").then((html) => {
        return components.render(html);
    }).then((output) => {
        res.send(output);
    }).catch((error) => {
        res.send("Panic, failed to render. " + error);
    });
});

var port = (process.env.PORT || 8080);
app.listen(port, () => console.log(`Listening on ${port}`));