const cache = require("memory-cache");
const request = require("request-promise");

module.exports = function getOembed(oembedUrl, itemUrl, height, width) {
    const url = `${oembedUrl}?url=${itemUrl}&maxheight=${height}&maxwidth=${width}`;

    const cachedResult = cache.get(url);
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
