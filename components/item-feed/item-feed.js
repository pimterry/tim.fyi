"use strict";

var readFile = require("fs-readfile-promise");
var components = require("server-components");
var mustache = require("mustache");
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
                items: _(items).sortBy((item) => item.timestamp)
                               .reverse()
                               .take(count)
                               .value()
            });
        });

        // TODO: Should this have a promise and wait for the expected
        // responses, instead of sources promise to return some data?
    };

    components.registerElement("item-feed", { prototype: ItemFeed });
}).catch((e) => console.log(e));