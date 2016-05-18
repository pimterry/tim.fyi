"use strict";

var components = require("server-components");
var componentsStatic = require("server-components-static");
var _ = require("lodash");

/**
 * A simple component to render social media icons and links to accounts for whatever platforms you're using.
 * The icons are all taken from Font Awesome, and only icons for the provided usernames are shown. The supported
 * platforms so far are Facebook, Twitter, Medium, LinkedIn, Github and Reddit.
 * 
 * @example
 * <social-media-icons twitter="pimterry" github="pimterry"></social-media-icons>
 */
var SocialMediaIcons = components.newElement();

var icons = [
    { name: "facebook", "icon": "facebook-square", "url": (username) => `https://www.facebook.com/${username}` },
    { name: "twitter",  "icon": "twitter-square",  "url": (username) => `https://twitter.com/${username}` },
    { name: "medium",   "icon": "medium",          "url": (username) => `https://medium.com/@${username}` },
    { name: "linkedin", "icon": "linkedin-square", "url": (username) => `https://linkedin.com/in/${username}` },
    { name: "github",   "icon": "github-square",   "url": (username) => `https://github.com/${username}` },
    { name: "reddit",   "icon": "reddit-square",   "url": (username) => `https://www.reddit.com/user/${username}` }
];

SocialMediaIcons.createdCallback = function () {
    componentsStatic.includeCSS(this.ownerDocument, "https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css");

    var iconToHtml = (icon) => `<a href="${icon.url(this.getAttribute(icon.name))}"><i class="fa fa-${icon.icon}"></i></a>`;

    this.innerHTML = icons.filter((icon) => this.hasAttribute(icon.name))
                          .map((icon) => iconToHtml(icon))
                          .join("");
};

components.registerElement("social-media-icons", { prototype: SocialMediaIcons });
