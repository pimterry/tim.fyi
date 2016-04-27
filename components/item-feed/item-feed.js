"use strict";

/**
 Defines a <item-feed> component, which listens for bubbling 'items-ready' events,
 with an 'items' property containing item data, and renders all items received.
 Each item must contain 'timestamp' (numeric), 'icon' (the code for a Font Awesome
 icon) and 'title' (HTML) properties, and can optionally contain 'url' (URL),
 'subtitle' (HTML), 'description' (HTML) and 'location' (HTML) properties.

 TODO: Look out for security issues in raw HTML here! Can that be dropped?
 Server-side XSS-style attacks would be a bad thing indeed. What if a data source
 injects component HTML (and thus executes code?).
 */

var readFile = require("fs-readfile-promise");
var components = require("server-components");
var mustache = require("mustache");
var moment = require("moment");
var _ = require("lodash");

var domino = require("domino");

readFile(__dirname + "/item-feed.html", 'utf8').then((rawHtml) => {
    var ItemFeed = components.newElement();

    ItemFeed.createdCallback = function () {
        var items = [];
        var count = this.getAttribute("count") || Infinity;

        var feedContentNode = this.ownerDocument.createElement("div");
        feedContentNode.classList.add("feed-content");
        this.insertBefore(feedContentNode, this.firstChild);

        this.addEventListener("items-ready", (itemsReadyEvent) => {
            items = items.concat(itemsReadyEvent.items);
            feedContentNode.innerHTML = mustache.render(rawHtml, {
                items: _(items)
                        .sortBy((item) => item.timestamp)
                        .reverse()
                        .take(count)
                        .map((item) => {
                          var timestamp = item.timestamp;
                          var time = moment(timestamp, "X");
                          item.relativeTime = time.fromNow();
                          return item;
                        })
                        .value()
            });
        });

        // TODO: Should this have a promise and wait for the expected
        // responses, instead of sources promise to return some data?
    };

    components.registerElement("item-feed", { prototype: ItemFeed });
}).catch((e) => console.log(e));
