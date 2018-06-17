# Crawler
A website crawler to extract all link recursively, count occurance and store request params.

## How does it work?
The url passed to the startCrawling function is pushed into request queue.It makes a request to initial url and gets the html response. After which it uses regular expresion to extract all urls from the html response having same host name and push them all in request queue. Recursively remove n urls from the request queue where n is the number of max concurrent requests.

Install with:

    git pull https://github.com/seal-7/Crawler.git
    cd Crawler
    npm install
    node app.js

## Usage Example

```js
var crawler = require('./crawler');

crawler.startCrawling('http://google.com/', 5);
```
startCrawling function will be taking 2 parameters,first is the url to be crawled and second is the number of concurrent requests.
