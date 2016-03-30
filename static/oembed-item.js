/*jslint browser:true */
"use strict";

if (document.registerElement) {
    var OEmbedItem = Object.create(HTMLElement.prototype);

    OEmbedItem.createdCallback = function () {
        this.addEventListener("click", function (e) {
            e.preventDefault();
            var oembedContent = this.querySelector("script[type='text/oembed-html']").innerHTML;
            this.innerHTML = oembedContent;
        });
    };

    document.registerElement("oembed-item", {
        prototype: OEmbedItem
    });
}