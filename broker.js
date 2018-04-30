const {ShardingManager} = require('discord.js');
const config = require('config');
const logger = require('ocelot-logger');
const Raven = require('raven');

Raven.config(config.get("Raven.DSN")).install();


const manager = new ShardingManager(`${__dirname}/ocelotbot.js`, config.get("Discord"),);


manager.spawn();

manager.on('launch', shard => {
    logger.log(`Successfully launched shard ${shard.id+1}/${manager.totalShards} (ID: ${shard.id})`);
});

manager.on('message', function(process, message){
    logger.log("Broadcasting message");
   manager.broadcast(message);
});