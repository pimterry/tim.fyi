"use strict";

var fs = require("fs");
var components = require("server-components");
var domino = require("domino");
var mustache = require("mustache");
var _ = require("lodash");

var getOembed = require("../../get-oembed");

// TODO: Build this into server-components for convenience?
function addScript(url, document) {
    var headElement = document.querySelector("head");

    var isScriptElementForUrl = (node) => {
        return node.tagName === "SCRIPT" && node.getAttribute("src") === url;
    };

    if (!_.find(headElement.childNodes, isScriptElementForUrl)) {
        var newScriptElement = document.createElement("script");
        newScriptElement.setAttribute("src", url);
        headElement.appendChild(newScriptElement);
    }
}

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
                        details: item.details,
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
