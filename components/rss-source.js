"use strict";

const components = require("server-components");
const truncateHtml = require("truncate-html");
const moment = require("moment");

const FeedReader = require('feed-reader');
const cache = require("memory-cache");

function getRss(url) {
    const cachedResult = cache.get(url);

    if (cachedResult) return Promise.resolve(cachedResult);
    else {
        return FeedReader.read(url, { descriptionMaxLen: 1000 })
        .catch((e) => {
            console.error('Feed error from ' + url, e)
            return [];
        })
        .then((result) => {
            cache.put(url, result, 1000 * 60 * 10);
            return result;
        });
    }
}

const RssSource = components.newElement();
RssSource.createdCallback = function () {
    const url = this.getAttribute("url");
    const icon = this.getAttribute("icon");
    const sourceTitle = this.getAttribute("title");

    return getRss(url).then((feed) => {
        this.dispatchEvent(new components.dom.CustomEvent('items-ready', {
            items: feed.entries.map((item) => {
                const title = (item.title && item.title.match(/\w/))
                    ? item.title
                    : "Post on " + sourceTitle;

                return {
                    title: title,
                    icon: icon,
                    timestamp: moment(item.published).unix(),
                    description: truncateHtml(item.description, 350, {
                        excludes: ['svg']
                    }),
                    url: item.link
                };
            }),
            bubbles: true
        }));
    });
};

const RssSummarySource = components.newElement();
RssSummarySource.createdCallback = function () {
    const url = this.getAttribute("url");
    const icon = this.getAttribute("icon");
    const sourceTitle = this.getAttribute("title");
    const useDescriptionAsTitle = this.getAttribute("descriptionAsTitle")

    return getRss(url).then((feed) => {
        this.dispatchEvent(new components.dom.CustomEvent('items-ready', {
            items: feed.entries.map((item) => {
                const description = truncateHtml(item.description, 110, {
                    excludes: ['svg']
                });

                const title = useDescriptionAsTitle
                    ? description
                        : (item.title && item.title.match(/\w/))
                    ? item.title
                    : "Post on " + sourceTitle;

                return {
                    title: title,
                    icon: icon,
                    timestamp: moment(item.published).unix(),
                    description: description,
                    subtitle: `<a href="${item.link}">View on ${sourceTitle}</a>`
                };
            }),
            bubbles: true
        }));
    });
};

components.registerElement("rss-source", { prototype: RssSource });
components.registerElement("rss-summary-source", { prototype: RssSummarySource });
