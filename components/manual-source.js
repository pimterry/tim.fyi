"use strict";

var components = require("server-components");
var domino = require("domino");

var ManualSource = components.newElement();
ManualSource.createdCallback = function () {
    this.dispatchEvent(new domino.impl.CustomEvent('items-ready', {
        items: [{ "icon": "icon.png", details: this.getAttribute("source"), timestamp: 0 }],
        bubbles: true
    }));
};

components.registerElement("manual-source", { prototype: ManualSource });