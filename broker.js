const {ShardingManager} = require('discord.js');
const config = require('config');
const logger = require('ocelot-logger');
const Raven = require('raven');
const express = require('express');
const app = express();
const port = 3006;
Raven.config(config.get("Raven.DSN")).install();


let commandList;

const manager = new ShardingManager(`${__dirname}/ocelotbot.js`, config.get("Discord"),);

let shardDeathCount = [];
let shardDeathTimeout = [];

manager.spawn();

manager.on('launch', function launchShard(shard) {
    logger.log(`Successfully launched shard ${shard.id+1}/${manager.totalShards} (ID: ${shard.id})`);

    shardDeathCount[shard.id] = 0;

    shard.on('death', function(){
        logger.warn(`Shard ${shard.id} died.`);

        if(shardDeathTimeout[shard.id])
            clearTimeout(shardDeathTimeout[shard.id]);

        if(++shardDeathCount[shard.id] > 15){
            logger.error(`Shard ${shard.id} is misbehaving! Killing it completely.`);
            shard.kill();
            manager.broadcast({
                type: "cockup",
                payload: `Shard ${shard.id} has crashed too many times.`
            });
        }else {
            shardDeathTimeout[shard.id] = setTimeout(resetShardDeaths, 30000, shard.id);
        }
    });
});

manager.on('message', function onMessage(process, message){
    if(message.type) {
        if(message.type === "commandList"){
            logger.log("Got command list");
            commandList = message.payload;
            return;
        }

        if(message.type === "dataCallback"){
            if(message.payload.callbackID && waitingCallbacks[message.payload.callbackID]){
                waitingCallbacks[message.payload.callbackID](message.payload.data);
                delete waitingCallbacks[message.payload.callbackID];
            }
            return;
        }
        logger.log("Broadcasting message");
        manager.broadcast(message);
    }
});



let callbackID = 1;
let waitingCallbacks = [];


function requestData(name, callback, additionalData){
    let id = callbackID++;
    waitingCallbacks[id] = callback;
    manager.broadcast({
        type: "requestData",
        payload: {
            name: name,
            callbackID: id,
            data: additionalData
        }
    })
}

function resetShardDeaths(shard){
    shardDeathCount[shard] = 0;
}


app.get('/commands', function(req, res){
    res.json(commandList);
});

app.get('/shard/count', function(req, res){
   res.json({count: manager.totalShards});
});

app.get('/server/:id/reloadConfig', function(req, res){
   res.json({});
   manager.broadcast({type: "reloadConfig", payload: req.params.id});
});

app.get('/server/:id/channels', function(req, res){
   requestData("channels", function(channels){
       res.json(channels);
   }, {server: req.params.id});
});

app.get('/shard/:id', function(req, res){
   const shard = manager.shards.get(manager.shards.keyArray()[req.params.id]);
   if(shard) {
       res.json({
           id: shard.id,
           ready: shard.ready
       });
   }else{
       res.json({});
   }
});

app.get('/user/:id/registerVote', function(req, res){
    console.log("Got vote from "+req.params.id);
    manager.broadcast({type: "registerVote", payload: {
        user: req.params.id
    }});
    res.json({});
});

app.post('/shard/:id/restart', function(req, res){
    const shard = manager.shards.get(manager.shards.keyArray()[req.params.id]);
    if(shard) {
       shard.respawn();
       res.json({success: true});
    }else{
        res.json({success: false});
    }
});


app.listen(port, "127.0.0.1", function(){
   logger.log(`Running broker API server on ${port}`);
});



