exports.getAllUrls = function (host,html) {

    //new RegExp('(http|https)://[^".*]*.' + host + '[^".*]*"','gi');
    var re = new RegExp('(http|https)://' + host + '[^"*]*[^"]*','gi');
    var validUrls = html.match(re);
    //console.log(JSON.stringify(validUrls));
    if(validUrls){
        return validUrls;
    }
    else{
        return [];
    }

}

exports.getParams = function (url) {

    var paramString = url.split('?');
    if(paramString.length >= 2){
       var params = paramString[1].split('&').map((param) => {
            return param.split('=')[0];
        });
       return params;
    }
    else {
        return [];
    }
}
exports.getHost = function (url) {

    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
        return match[2];
    }
    else {
        return null;
    }
}