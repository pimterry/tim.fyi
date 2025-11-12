"use strict";

var readFile = require("fs-readfile-promise");
var components = require("server-components");
var moment = require("moment");
var _ = require("lodash");

var getOembed = require("../get-oembed");

function includeOembed(item) {
    if (item.oembed) {
        return getOembed(item.oembed.root_url, item.oembed.item_url, 350, 800)
            .then((oembed) => {
                return _.merge(item, { description: oembed.html });
            })
            .catch((e) => {
                console.error(`Failed to include oembed ${item.oembed.item_url}: ${e}`);
                return null;
            });
    } else {
        return item;
    }
}

var ManualSource = components.newElement();
ManualSource.createdCallback = function () {
    var icon = this.getAttribute("icon");
    var sourceName = this.getAttribute("source");

    return readFile(`data/${sourceName}.json`, 'utf8').then((rawJson) => {
        var json = JSON.parse(rawJson);
        return Promise.all(json.map(includeOembed));
    }).then((items) => {
        const loadedItems = items.filter(i => !!i);

        this.dispatchEvent(new components.dom.CustomEvent('items-ready', {
            items: loadedItems.map((item) => {
                var datetime = item.datetime ? moment(item.datetime) : moment(item.date, "YYYY/MM/DD");

                return {
                    icon: icon,
                    title: item.title,
                    url: item.url,
                    timestamp: datetime.unix(),
                    description: item.description,
                    location: item.location,
                }
            }),
            bubbles: true
        }));
    });
};

components.registerElement("manual-source", { prototype: ManualSource });
