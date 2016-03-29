"use strict";

var components = require("server-components");
var domino = require("domino");
var request = require("request-promise");
var cache = require("memory-cache");

var OembedItemWrapper = components.newElement();
OembedItemWrapper.createdCallback = function () {
    var oembedUrl = this.getAttribute("url");
    var height = this.getAttribute("height") || 200;

    function getOembedHtml(itemUrl) {
        var url = `${oembedUrl}?url=${itemUrl}&maxheight=${height}`;

        var cachedResult = cache.get(url);
        if (cachedResult) return Promise.resolve(cachedResult);
        else {
            return request({
                url: url,
                json: true
            }).then((oembed) => {
                cache.put(url, oembed.html, 1000 * 60 * 60 * 24);
                return oembed.html;
            });
        }
    }

    // No errors are caught within this listener, because we have no promises out
    // Need an async approach so we can wait on this wrapper's completion
    this.addEventListener("items-ready", (itemsEvent) => {
        itemsEvent.stopPropagation();

        return Promise.all(itemsEvent.items.map((item) => {
            return getOembedHtml(item.url).then((oembedHtml) => { return {
                icon: item.icon,
                timestamp: item.timestamp,
                html: oembedHtml
            }});
        })).then((items) => {
            this.parentElement.dispatchEvent(new domino.impl.CustomEvent('items-ready', {
                items: items,
                bubbles: true
            }));
        }).catch((x) => console.error(`Failed to oembed: ${x}`));
    });
};

components.registerElement("oembed-item-wrapper", { prototype: OembedItemWrapper });