"use strict";

var readFile = require("fs-readfile-promise");
var components = require("server-components");
var mustache = require("mustache");
var _ = require("lodash");

var domino = require("domino");

var addScript = require("../../add-script");

readFile(__dirname + "/item-carousel.html", 'utf8').then((rawHtml) => {
    var ItemCarousel = components.newElement();

    ItemCarousel.createdCallback = function () {
        addScript("/item-carousel.runtime.js", this.ownerDocument);

        var items = [];
        var count = this.getAttribute("count") || Infinity;

        var feedContentNode = this.ownerDocument.createElement("div");
        feedContentNode.classList.add("carousel-content");
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
    };

    components.registerElement("item-carousel", { prototype: ItemCarousel });
}).catch((e) => console.log(e));
