"use strict";

var fs = require("fs");
var components = require("server-components");
var componentsStatic = require("server-components-static");
var mustache = require("mustache");

var getOembed = require("../../get-oembed");

var oembedItemHtml = fs.readFileSync(__dirname + "/oembed-item.html", 'utf8');

var OembedItemWrapper = components.newElement();
OembedItemWrapper.createdCallback = function () {
    componentsStatic.includeScript(this.ownerDocument, "/oembed-item.js");

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
            }).catch((e) => {
                console.error(`Failed to oembed ${item.url}: ${e}`);
                return undefined;
            });
        })).then((items) => {
            this.parentElement.dispatchEvent(new components.dom.CustomEvent('items-ready', {
                items: items.filter(i => !!i), // Filter out undefined results (errors)
                bubbles: true
            }));
        });
    });
};

components.registerElement("oembed-item-wrapper", { prototype: OembedItemWrapper });
