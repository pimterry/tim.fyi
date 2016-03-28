"use strict";

var components = require("server-components");
var domino = require("domino");
var Octokat = require("octokat");
var cache = require("memory-cache");

var _ = require("lodash");
var moment = require("moment");

var Github = components.newElement();
Github.createdCallback = function () {
    var github = new Octokat({
        token: process.env.GITHUB_TOKEN
    });

    function getAllEvents(username) {
        return Promise.all(_.range(1, 100).map((pageNum) => {
            // Note the catch() - we just skip any pages we can't successfully load
            return github.users(username).events.public.fetch({page: pageNum}).catch(() => [])
        })).then((eventPages) => {
            return _.flatten(eventPages);
        });
    }

    var typeFilter = this.getAttribute("type-filter");
    var username = this.getAttribute("username");
    var cacheId = "github-events-" + username;

    var cachedEvents = cache.get(cacheId);

    var getEventData;
    if (cachedEvents) getEventData = Promise.resolve(cachedEvents);
    else {
        getEventData = getAllEvents(username).then((events) => {
            cache.put(cacheId, events, 1000 * 60 * 1);
            return events;
        });
    }

    function formatDescription(event) {
        switch (event.type) {
            case "PullRequestEvent":
                return `Pull request to ${event.repo.name}: ${event.payload.pullRequest.title}`;
            default:
                return "Did something on Github";
        }
    }

    return getEventData.then((events) => {
        var items = events.filter((event) => {
            return !typeFilter || event.type === typeFilter
        }).map((event) => {
            return {
                icon: "github",
                details: formatDescription(event),
                timestamp: moment(event.createdAt, "dd MMM DD YYYY HH:mm:ss ZZ").unix()
            }
        });

        this.dispatchEvent(new domino.impl.CustomEvent('items-ready', {
            items: items,
            bubbles: true
        }));
    });
};

components.registerElement("github-source", { prototype: Github });