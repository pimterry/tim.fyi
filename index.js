"use strict";

require("dotenv").config();
require('newrelic');

var express = require("express");
var helmet = require("helmet");
var readFile = require("fs-readfile-promise");
var components = require("server-components");

require("./components/item-feed/item-feed");
require("./components/item-carousel/item-carousel");
require("./components/manual-source");
require("./components/twitter-source");
require("./components/github-source");
require("./components/rss-source");
require("./components/oembed-item-wrapper/oembed-item-wrapper");
require("./components/social-media-icons");
require("./components/copyright-notice");
require("./components/google-analytics");

var app = express();

app.use(express.static('static'));
app.use(helmet());

app.get('/', function (req, res) {
    res.set("Strict-Transport-Security", "max-age=31556926");

    readFile("index.html").then((html) => {
        return components.renderPage(html);
    }).then((output) => {
        res.send(output);
    }).catch((error) => {
        console.error(error, error.message, error.stack);
        res.status(500).send("Panic, failed to render.");
    });
});

var port = (process.env.PORT || 8080);
app.listen(port, () => console.log(`Listening on ${port}`));
