#!/bin/bash

#Remove linked containers if already exists
docker rm redis-node
docker rm crawler-redis

#Get docker image for crawler
docker run --name redis-node -d redis

#Get docker image for redis
docker pull redis

#Run redis container as a deamon
docker run --name redis-node -d redis

#Run crawler and link it to redis container
docker run --name crawler-redis --link redis-node:redis crawler
