"use strict";

var readFile = require("fs-readfile-promise");
var components = require("server-components");
var mustache = require("mustache");

var domino = require("domino");

var ItemFeed = components.newElement();
ItemFeed.createdCallback = function () {
    var items = [];

    this.addEventListener("items-ready", (itemsReadyEvent) => {
        items = items.concat(itemsReadyEvent.items);
    });

    return readFile(__dirname + "/item-feed.html", 'utf8').then((rawHtml) => {
        // TODO How to more clearly wait until all events have fired?
        this.innerHTML = mustache.render(rawHtml, { items: items });
    });
};

components.registerElement("item-feed", { prototype: ItemFeed });