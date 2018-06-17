var redis = require("redis"),
    client = redis.createClient({host: 'redis', port:'6379'});

exports.checkConnection = function () {
    return new Promise(function (resolve, reject) {
        client.on('ready',function () {
            resolve();
        });

        client.on('error',function (err) {
            reject(err);
        });
    })
};

exports.closeConnection = function () {

    setTimeout(function () {
        client.end(true);
    },1000);
};

exports.clearIfExist = function (key) {
    console.log("Deleting if exist : " + key);
    return new Promise(function (resolve, reject) {
        client.del(key,function (err, rply) {
            if(err){
                reject(err);
            }
            client.del(key+'_params',function (err, rply) {
                if(err){
                    reject(err);
                }
                resolve();
            })
        })
    })
};

var getValue = exports.getValue = function (key, field) {
    return new Promise(function (resolve, reject) {
        client.hget(key, field, function (err, reply) {
            if(err){
                reject(err);
            }
            resolve(reply);
        });
    });
};

exports.setValue = function (key, field, value, params) {

    client.hset(key, field, value, function (err, rply) {
       if(err){
           console.error("Error setting value for " + key +" in Redis! : line 39 model.js");
           throw err;
       }
    });
    getValue(key + '_params', field).then(function (rply) {
        var paramsInDb = [];
        if(rply){
            paramsInDb = JSON.parse(rply);
        }
        var set = new Set(params.concat(paramsInDb));
        client.hset(key + '_params', field, JSON.stringify(Array.from(set)),function (err, rply) {
            if(err){
                console.error("Error setting value for " + key +"_params in Redis! : line 45 model.js");
                throw err;
            }
        });
    }).catch(function (err) {
        throw err;
    })
};

