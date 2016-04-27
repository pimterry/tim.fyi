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

    var typeFilter = this.getAttribute("type-filter");
    var username = this.getAttribute("username");
    var cacheId = "github-events-" + username + "/" + typeFilter;

    function getEvents() {
        var cachedEvents = cache.get(cacheId);

        if (cachedEvents) return Promise.resolve(cachedEvents);
        else {
            return Promise.all(_.range(1, 10).map((pageNum) => {
                // Note the catch() - we just skip any pages we can't successfully load
                return github.users(username).events.public.fetch({page: pageNum}).catch(() => []);
            })).then((eventPages) => {
                var allEvents = _.flatten(eventPages);
                var relevantEvents = allEvents.filter((event) => !typeFilter || event.type === typeFilter);

                cache.put(cacheId, relevantEvents, 1000 * 60 * 1);
                return relevantEvents;
            });
        }
    }

    function formatDescription(event) {
        switch (event.type) {
            case "PullRequestEvent":
                return `Pull request to ${event.repo.name}: ${event.payload.pullRequest.title}`;
            default:
                return "Did something on Github";
        }
    }

    return getEvents().then((events) => {
        var items = events.map((event) => {
            return {
                icon: "github",
                title: formatDescription(event),
                timestamp: moment(event.createdAt, "dd MMM DD YYYY HH:mm:ss ZZ").unix()
            };
        });

        this.dispatchEvent(new domino.impl.CustomEvent('items-ready', {
            items: items,
            bubbles: true
        }));
    });
};

components.registerElement("github-source", { prototype: Github });
