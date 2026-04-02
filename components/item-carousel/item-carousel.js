"use strict";

var fs = require("fs");
var components = require("server-components");
var componentsStatic = require("server-components-static");
var mustache = require("mustache");
var _ = require("lodash");

var rawHtml = fs.readFileSync(__dirname + "/item-carousel.html", 'utf8');

var ItemCarousel = components.newElement();

ItemCarousel.createdCallback = function () {
    // Include a tiny client-side web components polyfill, just because it makes the runtime script way nicer.
    componentsStatic.includeScript(this.ownerDocument, "https://cdn.rawgit.com/WebReflection/document-register-element/0.6.1/build/document-register-element.js");
    // Add some nice buttons to scroll back and forth at runtime
    componentsStatic.includeScript(this.ownerDocument, "/item-carousel.runtime.js");

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
