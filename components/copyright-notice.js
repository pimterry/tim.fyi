"use strict";

var components = require("server-components");

var CopyrightNotice = components.newElement();

CopyrightNotice.createdCallback = function () {
    var name = this.getAttribute("name");
    var currentYear = new Date().getFullYear();
    this.innerHTML = `&copy; ${currentYear} ${name}. All rights reserved.`;
};

components.registerElement("copyright-notice", { prototype: CopyrightNotice });
