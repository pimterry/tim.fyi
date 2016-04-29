var _ = require("lodash");

/**
 * Takes a script URL and a document DOM. Adds a script tag
 * in the document <head> for the URL, if one doesn't already exist.
 */

// TODO: Build this into server-components for convenience
module.exports = function addScript(url, document) {
    var headElement = document.querySelector("head");

    var isScriptElementForUrl = (node) => {
        return node.tagName === "SCRIPT" && node.getAttribute("src") === url;
    };

    if (!_.find(headElement.childNodes, isScriptElementForUrl)) {
        var newScriptElement = document.createElement("script");
        newScriptElement.setAttribute("src", url);
        headElement.appendChild(newScriptElement);
    }
}
