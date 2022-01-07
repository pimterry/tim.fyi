"use strict";

var components = require("server-components");
var Twit = require("twit");
var cache = require("memory-cache");
var moment = require("moment");

var Twitter = components.newElement();
Twitter.createdCallback = function () {
    var twitter = new Twit({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    });

    var username = this.getAttribute("username");
    var cacheId = "twitter-statuses-" + username;

    var cachedTweets = cache.get(cacheId);

    var getTweetData;
    if (cachedTweets) getTweetData = Promise.resolve(cachedTweets);
    else {
        getTweetData = twitter.get("statuses/user_timeline", {
            screen_name: username,
            exclude_replies: true,
            include_rts: false,
            count: 200
        }).then((response) => {
            var tweets = response.data;
            cache.put(cacheId, tweets, 1000 * 60 * 1);
            return tweets;
        });
    }

    return getTweetData.then((tweets) => {
        var items = tweets.map((tweet) => {
            var tweetText = tweet.entities.urls.reduce((tweetText, url) => {
                return tweetText.replace(url.url,
                    `<a href="${url.expanded_url}">${url.expanded_url}</a>`);
            }, tweet.text);

            return {
                icon: "twitter",
                title: tweetText,
                timestamp: moment(tweet.created_at, 'dd MMM DD HH:mm:ss ZZ YYYY', 'en').unix(),
                subtitle: `<i class="fa fa-twitter"></i>
                           <a href="https://twitter.com/pimterry/status/${tweet.id_str}">View on Twitter</a>`,
                location: tweet.place? tweet.place.full_name : undefined
            };
        });

        this.dispatchEvent(new components.dom.CustomEvent('items-ready', {
            items: items,
            bubbles: true
        }));
    });
};

components.registerElement("twitter-source", { prototype: Twitter });
