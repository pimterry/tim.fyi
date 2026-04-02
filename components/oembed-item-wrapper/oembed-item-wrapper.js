"use strict";

const fs = require("fs");
const components = require("server-components");
const componentsStatic = require("server-components-static");
const mustache = require("mustache");

const getOembed = require("../../get-oembed");

const oembedItemHtml = fs.readFileSync(__dirname + "/oembed-item.html", 'utf8');

const OembedItemWrapper = components.newElement();
OembedItemWrapper.createdCallback = function () {
    componentsStatic.includeScript(this.ownerDocument, "/oembed-item.js");

    const oembedUrl = this.getAttribute("url");
    const height = this.getAttribute("height") || 200;
    const width = this.getAttribute("width") || (height * 3);

    // Return a promise that resolves once the child source's items have been
    // enriched with oEmbed data and re-dispatched to the parent element.
    return new Promise((resolveWrapper) => {
        this.addEventListener("items-ready", (itemsEvent) => {
            itemsEvent.stopPropagation();

            Promise.all(itemsEvent.items.map((item) => {
                return getOembed(oembedUrl, item.url, height, width).then((oembedData) => {
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
                    items: items.filter(i => !!i),
                    bubbles: true
                }));
                resolveWrapper();
            });
        });
    });
};

components.registerElement("oembed-item-wrapper", { prototype: OembedItemWrapper });
