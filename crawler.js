var rp = require('request-promise');
var scrappy = require('./scrappy');
var redis = require('./models/model');

var Crawler = (function () {
    return {
        maxSize : 5,
        canHandleRequest : 5,
        requestQueue : [],
        processRequest : function () {

            if (Crawler.canHandleRequest > 0 && Crawler.requestQueue.length > 0) {
                //Reduce the max Size
                Crawler.canHandleRequest--;
                var request = Crawler.requestQueue.shift();
                redis.getValue(request.host,request.url).then(function (value) {

                    if(value){

                        var urlWithoutParams = request.url.split('?')[0];
                        console.log("Same Url Again:"+ urlWithoutParams + " \nCurrent requests in progress " + (Crawler.maxSize-Crawler.canHandleRequest));
                        redis.setValue(request.host, urlWithoutParams, parseInt(value) + 1, scrappy.getParams(request.url));
                        Crawler.canHandleRequest++;
                        if(Crawler.requestQueue.length > 0){
                            Crawler.processRequest();
                        }
                        else {
                            if (Crawler.canHandleRequest == Crawler.maxSize) {
                                //Queue is empty and No request is in progress
                                redis.closeConnection();
                            }
                        }

                    }
                    else{

                        var urlWithoutParams = request.url.split('?')[0];
                        console.log("New Url:"+ urlWithoutParams + " \nCurrent requests in progress " + (Crawler.maxSize-Crawler.canHandleRequest));
                        redis.setValue(request.host, urlWithoutParams, 1,  scrappy.getParams(request.url));

                        var options = {
                            uri: request.url,
                            simple: false,
                        };
                        rp(options).then(function (html) {

                            var urls = scrappy.getAllUrls(request.host,html);
                            urls.forEach((url) => {
                                Crawler.requestQueue.push({url : url, host : scrappy.getHost(url)});
                            });
                            Crawler.canHandleRequest++;
                            if(Crawler.requestQueue.length > 0){
                                Crawler.processRequest();
                            }
                            else {
                                if (Crawler.canHandleRequest == Crawler.maxSize) {
                                    //Queue is empty and No request is in progress
                                    redis.closeConnection();
                                }
                            }

                        }).catch(function (reason) {
                            console.error("For url: " + reason.options.uri + "\n" + reason.cause.message);
                        }).finally(function () {
                            if(Crawler.requestQueue.length > 0){
                                Crawler.processRequest();
                            }
                            else {
                                if (Crawler.canHandleRequest == Crawler.maxSize) {
                                    //Queue is empty and No request is in progress
                                    redis.closeConnection();
                                }
                            }
                        });

                    }
                }).catch(function (err) {
                    console.error("Error getting value from Redis! : line 74 crawler.js");
                    throw err;
                }).then(function () {
                    //Finally Block
                    if(Crawler.requestQueue.length > 0){
                        Crawler.processRequest();
                    }
                    else {
                        if (Crawler.canHandleRequest == Crawler.maxSize) {
                            //Queue is empty and No request is in progress
                            redis.closeConnection();
                        }
                    }
                });

            }
            else{
                if(Crawler.canHandleRequest == Crawler.maxSize && Crawler.requestQueue.length == 0){
                    //Queue is empty and No request is in progress
                    redis.closeConnection();
                }
            }
        }
    }
}());


exports.startCrawling = function (url, maxConcurrentRequests) {

    redis.checkConnection().then(function () {

        console.log("Connection to Redis established!");
        var host = scrappy.getHost(url);

        redis.clearIfExist(host).then(function () {
            Crawler.maxSize = maxConcurrentRequests;
            Crawler.canHandleRequest = maxConcurrentRequests;
            Crawler.requestQueue.push({url : url, host : host});
            Crawler.processRequest();

        }).catch(function (err) {
            console.error("Problem deleting key! line 97 crawler.js");
            redis.closeConnection();
            throw err;
        });

    }).catch(function (err) {
        console.error("Are you sure you have Redis installed and running?");
        throw err;
    });

};
