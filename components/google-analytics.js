"use strict";

var components = require("server-components");

var GoogleAnalytics = components.newElement();

GoogleAnalytics.createdCallback = function (document) {
    var trackingId = this.getAttribute("tracking-id");

    var scriptTag = document.createElement("script");
    scriptTag.innerHTML = `
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', '${trackingId}', 'auto');
        ga('send', 'pageview');
    `;

    this.appendChild(scriptTag);
};

components.registerElement("google-analytics", { prototype: GoogleAnalytics });
