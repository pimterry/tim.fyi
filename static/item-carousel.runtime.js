/*jslint browser:true */
"use strict";

if (document.registerElement) {
    var CarouselArrow = Object.create(HTMLElement.prototype);

    CarouselArrow.createdCallback = function () {
        var arrowIconName = {
            "right": "angle-right",
            "left": "angle-left"
        }[this.getAttribute("direction")];

        this.innerHTML = "<i class='fa fa-" + arrowIconName + "'></i>";
        this.style.visibility = "visible";

        var carouselContentWrapper = this.parentNode;

        this.addEventListener("click", function (e) {
            e.preventDefault();
            var currentScrollDistance = carouselContentWrapper.scrollLeft;
            var carouselElements = carouselContentWrapper.querySelectorAll(".carousel-item");

            var i, element;
            var margin = 5;

            // Work out what the next element to show in either direction is
            // and set the current scroll distance to show that.
            if (this.getAttribute("direction") === "right") {
                for (i = 0; i < carouselElements.length; i++) {
                    element = carouselElements[i];
                    if (element.offsetLeft > currentScrollDistance + margin) {
                        carouselContentWrapper.scrollLeft = element.offsetLeft;
                        break;
                    }
                }
            }
            else if (this.getAttribute("direction") === "left") {
                for (i = carouselElements.length - 1; i >= 0; i--) {
                    element = carouselElements[i];
                    if (element.offsetLeft < currentScrollDistance - margin) {
                        carouselContentWrapper.scrollLeft = element.offsetLeft;
                        break;
                    }
                }
            }
        });
    };

    document.registerElement("carousel-arrow", {
        prototype: CarouselArrow
    });
}
