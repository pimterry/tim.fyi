var cache = require("memory-cache");
var request = require("request-promise");

module.exports = function getOembed(oembedUrl, itemUrl, height) {
    var url = `${oembedUrl}?url=${itemUrl}&maxheight=${height}`;

    var cachedResult = cache.get(url);
    if (cachedResult) return Promise.resolve(cachedResult);
    else {
        return request({
            url: url,
            json: true
        }).then((oembed) => {
            cache.put(url, oembed, 1000 * 60 * 60 * 24);
            return oembed;
        });
    }
}
