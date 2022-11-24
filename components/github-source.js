"use strict";

var components = require("server-components");
var Octokat = require("octokat");
var cache = require("memory-cache");

var _ = require("lodash");
var moment = require("moment");

var Github = components.newElement();
Github.createdCallback = function () {
    var github = new Octokat({
        token: process.env.GITHUB_TOKEN
    });

    var filter = JSON.parse(this.getAttribute("filter"));
    var username = this.getAttribute("username");
    var cacheId = "github-events-" + username + "/" + JSON.stringify(filter);

    function getEvents() {
        var cachedEvents = cache.get(cacheId);

        if (cachedEvents) return Promise.resolve(cachedEvents);
        else {
            return Promise.all(_.range(1, 10).map((pageNum) => {
                return github.users(username).events.public.fetch({
                    page: pageNum,
                    per_page: 100
                })
                // We just skip any pages we can't successfully load:
                .catch(() => []);
            })).then((eventPages) => {
                var allEvents = _.flatten(eventPages);
                var relevantEvents = allEvents.filter(_.matches(filter));

                cache.put(cacheId, relevantEvents, 1000 * 60 * 1);
                return relevantEvents;
            });
        }
    }

    function eventDetails(event) {
        switch (event.type) {
            case "PullRequestEvent":
                return {
                  title: event.payload.pullRequest.title,
                  subtitle: `<i class="fa-solid fa-code-branch icon"></i>Pull request to ${event.repo.name}`,
                  url: event.payload.pullRequest.htmlUrl
                };
            case "CreateEvent":
                return {
                  title: `New repo: ${event.repo.name}`,
                  subtitle: event.payload.description ?
                    `<i class="fa-solid fa-bolt icon"></i>${event.payload.description}` : '',
                  url: `https:\/\/github.com/${event.repo.name}`
                };
            case "IssuesEvent":
                return {
                    title: event.payload.issue.title,
                    subtitle: `<i class="fa-brands fa-github-alt icon"></i>New issue on ${event.repo.name}`,
                    url: event.payload.issue.htmlUrl
                };
            default:
                console.log("Unrecognized event", event.type);
                return {
                  title: "Did something on Github"
                };
        }
    }

    return getEvents().then((events) => {
        var items = events.map((event) => {
            return _.merge({
                icon: "fa-brands fa-github",
                timestamp: moment(event.createdAt, "dd MMM DD YYYY HH:mm:ss ZZ").unix()
            }, eventDetails(event));
        });

        this.dispatchEvent(new components.dom.CustomEvent('items-ready', {
            items: items,
            bubbles: true
        }));
    });
};

components.registerElement("github-source", { prototype: Github });
