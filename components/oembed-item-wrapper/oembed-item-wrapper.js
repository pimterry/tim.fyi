"use strict";

var fs = require("fs");
var components = require("server-components");
var domino = require("domino");
var mustache = require("mustache");

var getOembed = require("../../get-oembed");
var addScript = require("../../add-script");

var oembedItemHtml = fs.readFileSync(__dirname + "/oembed-item.html", 'utf8');

var OembedItemWrapper = components.newElement();
OembedItemWrapper.createdCallback = function () {
    addScript("/oembed-item.js", this.ownerDocument);

    var oembedUrl = this.getAttribute("url");
    var height = this.getAttribute("height") || 200;

    // No errors are caught within this listener, because we have no promises out
    // Need an async approach so we can wait on this wrapper's completion
    this.addEventListener("items-ready", (itemsEvent) => {
        itemsEvent.stopPropagation();

        return Promise.all(itemsEvent.items.map((item) => {
            return getOembed(oembedUrl, item.url, height).then((oembedData) => {
                return {
                    timestamp: item.timestamp,
                    html: mustache.render(oembedItemHtml, {
                        oembed: oembedData,
                        title: item.title,
                        url: item.url
                    })
                }
            });
        })).then((items) => {
            this.parentElement.dispatchEvent(new domino.impl.CustomEvent('items-ready', {
                items: items,
                bubbles: true
            }));
        }).catch((x) => console.error(`Failed to oembed: ${x}`));
    });
};

components.registerElement("oembed-item-wrapper", { prototype: OembedItemWrapper });
