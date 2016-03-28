"use strict";

var components = require("server-components");
var domino = require("domino");
var cache = require("memory-cache");
var moment = require("moment");

var feedparser = require('feedparser-promised');

var RssSource = components.newElement();
RssSource.createdCallback = function () {
    var url = this.getAttribute("url");
    var icon = this.getAttribute("icon");

    return feedparser.parse(url).then((items) => {
        this.dispatchEvent(new domino.impl.CustomEvent('items-ready', {
            items: items.map((item) => { return {
                details: item.title,
                icon: icon,
                timestamp: moment(item.pubDate).unix()
            }}),
            bubbles: true
        }));
    });
};

components.registerElement("rss-source", { prototype: RssSource });