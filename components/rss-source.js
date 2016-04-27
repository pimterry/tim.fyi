"use strict";

var components = require("server-components");
var domino = require("domino");
var moment = require("moment");

var feedparser = require('feedparser-promised');
var cache = require("memory-cache");

function getRss(url) {
    var cachedResult = cache.get(url);

    if (cachedResult) return Promise.resolve(cachedResult);
    else {
        return feedparser.parse(url).then((result) => {
            cache.put(url, result, 1000 * 60 * 10);
            return result;
        });
    }
}

var RssSource = components.newElement();
RssSource.createdCallback = function () {
    var url = this.getAttribute("url");
    var icon = this.getAttribute("icon");

    return getRss(url).then((items) => {
        this.dispatchEvent(new domino.impl.CustomEvent('items-ready', {
            items: items.map((item) => { return {
                title: item.title,
                icon: icon,
                timestamp: moment(item.pubDate).unix()
            }}),
            bubbles: true
        }));
    });
};

components.registerElement("rss-source", { prototype: RssSource });
