"use strict";

var readFile = require("fs-readfile-promise");
var components = require("server-components");
var domino = require("domino");
var moment = require("moment");
var _ = require("lodash");

var getOembed = require("../get-oembed");

var ManualSource = components.newElement();
ManualSource.createdCallback = function () {
    var icon = this.getAttribute("icon");
    var sourceName = this.getAttribute("source");

    return readFile(`data/${sourceName}.json`, 'utf8').then((rawJson) => {
        var json = JSON.parse(rawJson);

        return Promise.all(json.map((item) => {
          if (item.oembed) {
            return getOembed(item.oembed.root_url, item.oembed.item_url, 250).then((oembed) => {
              var newItem = _.merge(item, { description: oembed.html });
              console.log(item, newItem);
              return newItem;
            });
          } else {
            return item;
          }
        }))
      }).then((loadedItems) => {
        this.dispatchEvent(new domino.impl.CustomEvent('items-ready', {
            items: loadedItems.map((item) => { return {
                icon: icon,
                title: item.title,
                url: item.url,
                timestamp: moment(item.date, "YYYY/MM/DD").unix(),
                description: item.description,
                location: item.location,
            }}),
            bubbles: true
        }));
    });
};

components.registerElement("manual-source", { prototype: ManualSource });
