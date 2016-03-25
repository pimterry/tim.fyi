"use strict";

var components = require("server-components");
var _ = require("lodash");

var domino = require("domino");

var SocialMediaIcons = components.newElement();

var icons = [
    { name: "facebook", "icon": "facebook-square", "url": (username) => `https://www.facebook.com/${username}` },
    { name: "twitter",  "icon": "twitter-square",  "url": (username) => `https://twitter.com/${username}` },
    { name: "medium",   "icon": "medium",          "url": (username) => `https://medium.com/@${username}` },
    { name: "linkedin", "icon": "linkedin-square", "url": (username) => `https://linkedin.com/in/${username}` },
    { name: "github",   "icon": "github-square",   "url": (username) => `https://github.com/${username}` },
    { name: "reddit",   "icon": "reddit-square",   "url": (username) => `https://www.reddit.com/user/${username}` }
];

// TODO: Build this into server-components for convenience?
function addExternalStylesheet(url, document) {
    var headElement = document.querySelector("head");

    var isLinkElementForUrl = (node) => {
        return node.tagName === "LINK" && node.getAttribute("href") === url;
    };

    if (!_.find(headElement.childNodes, isLinkElementForUrl)) {
        var newLinkElement = document.createElement("link");
        newLinkElement.setAttribute("rel", "stylesheet");
        newLinkElement.setAttribute("href", url);
        headElement.appendChild(newLinkElement);
    }
}

SocialMediaIcons.createdCallback = function () {
    addExternalStylesheet("https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css", this.ownerDocument);

    var iconToHtml = (icon) => `<a href="${icon.url(this.getAttribute(icon.name))}"><i class="fa fa-${icon.icon}"></i></a>`;

    this.innerHTML = icons.filter((icon) => this.hasAttribute(icon.name))
                          .map((icon) => iconToHtml(icon))
                          .join("");
};

components.registerElement("social-media-icons", { prototype: SocialMediaIcons });