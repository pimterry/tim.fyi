"use strict";

var components = require("server-components");
var truncateHtml = require("truncate-html");
var moment = require("moment");

var feedparser = require('feedparser-promised');
var cache = require("memory-cache");

function getRss(url) {
    var cachedResult = cache.get(url);

    if (cachedResult) return Promise.resolve(cachedResult);
    else {
        return feedparser.parse(url)
        .catch((e) => {
            console.error('Feed error from ' + url, e)
            return [];
        })
        .then((result) => {
            cache.put(url, result, 1000 * 60 * 10);
            return result;
        });
    }
}

var RssSource = components.newElement();
RssSource.createdCallback = function () {
    var url = this.getAttribute("url");
    var icon = this.getAttribute("icon");
    var sourceTitle = this.getAttribute("title");

    return getRss(url).then((items) => {
        this.dispatchEvent(new components.dom.CustomEvent('items-ready', {
            items: items.map((item) => {
                var title = (item.title && item.title.match(/\w/))
                    ? item.title
                    : "Post on " + sourceTitle;
                return {
                    title: title,
                    icon: icon,
                    timestamp: moment(item.pubDate).unix(),
                    description: truncateHtml(item.description, 600),
                    url: item.link
                };
            }),
            bubbles: true
        }));
    });
};

components.registerElement("rss-source", { prototype: RssSource });
