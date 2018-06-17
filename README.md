# Crawler
A website crawler to extract all link recursively, count occurance and store request params.

## How does it work?
The url passed to the startCrawling function is pushed into request queue.It makes a request to initial url and gets the html response. After which it uses regular expresion to extract all urls from the html response having same host name and push them all in request queue. Recursively remove n urls from the request queue where n is the number of max concurrent requests.

# Install with docker:

    ./runWithDocker.sh
    
Get the redis shell:

    docker exec -it redis-node redis-cli    

Stop Crawler:

    docker stop `docker ps -q -f name=crawler`
    
Stop Redis:

    docker stop `docker ps -q -f name=redis`    

# Install with:

Note: Remember to start redis as a service.

    git pull https://github.com/seal-7/Crawler.git
    cd Crawler
    npm install
    node app.js
     

## Usage Example

startCrawling function will be taking 2 parameters,first is the url to be crawled and second is the number of concurrent requests.

```js
var crawler = require('./crawler');

crawler.startCrawling('http://google.com/', 5);
```

To see through the data crawler has collected:
    
    redis-cli
Get all keys:

    127.0.0.1:6379>KEYS *
    
Get all urls and count of occurance:

    127.0.0.1:6379>HGETALL medium.com
    
Get all urls and params:

    127.0.0.1:6379>HGETALL medium.com_params
    
Learn more commands from https://redis.io/commands
