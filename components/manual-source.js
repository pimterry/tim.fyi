"use strict";

var readFile = require("fs-readfile-promise");
var components = require("server-components");
var domino = require("domino");
var moment = require("moment");

var ManualSource = components.newElement();
ManualSource.createdCallback = function () {
    var icon = this.getAttribute("icon");
    var sourceName = this.getAttribute("source");

    return readFile(`data/${sourceName}.json`, 'utf8').then((rawJson) => {
        var json = JSON.parse(rawJson);
        this.dispatchEvent(new domino.impl.CustomEvent('items-ready', {
            items: json.map((item) => { return {
                icon: icon,
                title: item.title,
                url: item.url,
                timestamp: moment(item.date, "YYYY/MM/DD").unix()
            }}),
            bubbles: true
        }));
    });
};

components.registerElement("manual-source", { prototype: ManualSource });
