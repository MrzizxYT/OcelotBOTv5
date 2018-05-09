const Discord = require('discord.js');
const request = require('request');
const config = require('config');
module.exports = {
    name: "Discord.js Integration",
    init: function(bot){

        Discord.Message.prototype.replyLang = async function(message, values){
           return this.channel.send(await bot.lang.getTranslation(this.guild ? this.guild.id : "322032568558026753", message, values));
        };

        Discord.Message.prototype.editLang = async function(message, values){
            return this.edit(await bot.lang.getTranslation(this.guild ? this.guild.id : "322032568558026753", message, values));
        };


        bot.client = new Discord.Client();

        bot.client.on("ready", async function discordReady(){
            bot.logger.log(`Logged in as ${bot.client.user.tag}!`);
            const serverCount   = (await bot.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);
            bot.client.user.setPresence({
                game: {
                    name: `${serverCount} servers.`,
                    type: "LISTENING"
                }
            });
        });

        bot.client.on("reconnecting", function discordReconnecting(){
            bot.logger.log("Reconnecting...");
        });

        let lastPresenceUpdate = 0;

        bot.client.on("guildCreate", async function joinGuild(guild){
             bot.logger.log(`Joined server ${guild.id} (${guild.name})`);

             const now = new Date();
             if(now-lastPresenceUpdate>100000) {
                 lastPresenceUpdate = now;
                 request.post({
                     headers: {
                         "Authorization": config.get("Discord.discordBotsKey"),
                         "Content-Type": "application/json"
                     },
                     url: "https://bots.discord.pw/api/bots/146293573422284800/stats",
                     json: true,
                     body: {
                         server_count: bot.client.guilds.size,
                         shard_id: bot.client.shard.id,
                         shard_count: bot.client.shard.count
                     }
                 }, function (err, resp, body) {
                     console.log(body);
                 });
                 request.post({
                     headers: {
                         "Authorization": config.get("Discord.discordBotsOrgKey"),
                         "Content-Type": "application/json"
                     },
                     url: "https://discordbots.org/api/bots/146293573422284800/stats",
                     json: true,
                     body: {
                         server_count: bot.client.guilds.size,
                         shard_id: bot.client.shard.id,
                         shard_count: bot.client.shard.count
                     }
                 }, function (err, resp, body) {
                     console.log(body);
                 });

                 const serverCount   = (await bot.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);
                 bot.client.user.setPresence({
                        game: {
                            name: `${serverCount} servers.`,
                            type: "LISTENING"
                        }
                 });
             }
            await bot.database.addServer(guild.id, guild.owner_id, guild.name, guild.joined_at);

        });

        bot.client.on("guildDelete", async function leaveGuild(guild){
            bot.logger.log(`Left server ${guild.id} (${guild.name})`);
            await bot.database.leaveServer(guild.id);
        });


        bot.client.login();

    }
};