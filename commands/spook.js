const Discord = require('discord.js');
module.exports = {
    name: "Spook",
    usage: "spook <user>",
    categories: ["fun"],
    requiredPermissions: [],
    commands: ["spook", "spooked"],
    init: async function(bot){
        bot.setSpookyPresence = async function(){
            const result = await bot.database.getSpookedServers();
            bot.client.user.setPresence({
                game: {
                    name: `👻 !spook ~ ${result.total[0]['COUNT(*)']} SPOOKED.`,
                    type: "WATCHING"
                }
            });
        };

        bot.client.on("ready", async function ready(){
            bot.logger.log("Setting spooky presence");
            await bot.setSpookyPresence();

            bot.spooked = {};

            const spookedResult = await bot.database.getSpooked();

            for(let i = 0; i < spookedResult.length; i++){
                const spook = spookedResult[i];
                if(bot.client.guilds.has(spook.server) && !bot.spooked[spook.server]){
                    bot.spooked[spook.server] = {
                        user: spook.spooked,
                        timer: setTimeout(bot.generateNewSpook, 8.64e+7, spook.server) //24 Hours
                    }
                }
            }
            bot.logger.log("This shard has "+Object.keys(bot.spooked).length+" spooked servers.");
        });

        bot.spookReactChance = 0.6;

        bot.client.on("message", function(message){
           if(bot.spooked && message.guild && bot.spooked[message.guild.id]){
               // noinspection EqualityComparisonWithCoercionJS
               if(bot.spooked[message.guild.id].user == message.author.id){
                   clearTimeout(bot.spooked[message.guild.id].timer);
                   bot.spooked[message.guild.id].timer = setTimeout(bot.generateNewSpook, 8.64e+7, message.guild.id);
                   if(message.channel.permissionsFor(bot.client.user).has("ADD_REACTIONS") && Math.random() > bot.spookReactChance){
                        bot.logger.log(`Reacting to message in ${message.guild.name} (${message.guild.id})`);
                        message.react("👻");
                   }
               }
           }
        });


        bot.generateNewSpook = async function generateNewSpook(server, left){
            bot.logger.warn("Generating new spook for "+server);
            if (!bot.client.guilds.has(server)) {
                bot.logger.warn("Spooked server no longer exists.");
            }else{
                const guild = bot.client.guilds.get(server);
                const lastSpook = await bot.database.getSpooked(server);
                const availableChannels = guild.channels.filter(function(guildChannel){
                    return guildChannel.type === "text" && guildChannel.permissionsFor(bot.client.user).has("SEND_MESSAGES");
                });
                const channel = availableChannels.random(1)[0];
                const lastMessages = (await channel.fetchMessages({limit: 50})).filter(function(message){
                    return !message.author.bot && message.guild.members.has(message.author.id);
                });
                const target = lastMessages.random(1)[0].author;
                bot.logger.log("New target is "+target.id);
                bot.logger.log(`Spooked server name is ${guild.name} - notifying in ${channel.name} (${channel.id})`);
                if(left)
                    channel.send(`:ghost: The spooked user has left the server.\n**The spook passes to <@${target.id}>!**`);
                else
                    channel.send(`:ghost: The spooked user (<@${lastSpook[0].spooked}>) has not spoken for 24 hours.\n**The spook passes to <@${target.id}>!**`);

                await bot.database.spook(target.id, lastSpook[0].spooked, server, lastSpook[0].spookedUsername, target.username);
                if(bot.spooked[server].timer)
                    clearTimeout(bot.spooked[server].timer);
                bot.spooked[server] = {
                    user: target.id,
                    timer: setTimeout(bot.generateNewSpook, 8.64e+7, server) //24 Hours
                };
            }
        };

        bot.client.on("guildMemberRemove", async function guildMemberRemove(member){
            const guild = member.guild;
            const result = await bot.database.getSpooked(guild.id);
            if(result[0] && result[0].spooked == member.id){
                bot.logger.log("Spooked user left");
                bot.generateNewSpook(guild.id, true);
            }
        });



        bot.spookSanityCheck = async function spookSanityCheck(){
            bot.logger.log("Sanity checking spooks...");
            const servers = await bot.database.getParticipatingServers();
            for(let i = 0; i < servers.length; i++){
                const serverID = servers[i].server;
                if(bot.client.guilds.has(serverID)){
                    const spooked = await bot.database.getSpooked(serverID);
                    if(!bot.client.guilds.get(serverID).members.has(spooked[0].spooked)){
                        bot.logger.log("Spooked user no longer exists for "+serverID);
                        bot.generateNewSpook(serverID, true);
                    }
                }
            }
        };

        bot.spookSanityCheck();


        bot.sendSpookEnd = async function sendSpookSend(id, channel){
            if(!bot.client.guilds.has(id))return;
            const server = bot.client.guilds.get(id);
            const spooked = await bot.database.getSpooked(id);
            if(!spooked[0]){
                bot.logger.log(`${server.name} (${server.id}) didn't participate in the spooking.`);
            }else {
                const loser = spooked[0].spooked;
                bot.logger.log(`Sending spook end for ${server.name} (${server.id})`);
                if (!channel) {
                    const eligibleChannels = server.channels.filter(function (channel) {
                        return channel.permissionsFor(bot.client.user).has("SEND_MESSAGES");
                    });
                }
                const targetChannel = channel || eligibleChannels.first();
                bot.logger.log(`Target channel for ${server.name} (${server.id}) is ${targetChannel.name} (${targetChannel.id})`);

                const spookStats = await bot.database.getSpookStats(id);

                let embed = new Discord.RichEmbed();
                embed.setColor(0xd04109);
                embed.setTitle("The Spooking Has Ended.");
                embed.setTimestamp(new Date());
                embed.setFooter("Happy Halloween!", "https://cdn.discordapp.com/avatars/146293573422284800/a3ba7bf8004a9446239e0113b449a30c.png?size=128");
                embed.setImage("http://ocelot.xyz/graph.php?server="+id);
                embed.setDescription(`Thank you all for participating.\n**<@${loser}> is the loser!**\nIf you enjoyed this halloween event please consider [voting for OcelotBOT](https://discordbots.org/bot/146293573422284800/vote).`);
                embed.addField("Total Spooks", spookStats.totalSpooks, true);
                embed.addField("Most Spooked User", `<@${spookStats.mostSpooked.spooked}> (${spookStats.mostSpooked['COUNT(*)']} times)`, true);
                embed.addField("Longest Spook", `<@${spookStats.longestSpook.spooked}> (Spooked for ${bot.util.prettySeconds(spookStats.longestSpook.diff)})`);
                embed.addField("Spook Graph", "Below is a graph of all the spooks on this server.\nOr click [here](https://ocelot.xyz/graph.png) for a graph of all the spooks across all servers.");
                targetChannel.send("", embed);
            }

        };

    },
    run: async function(message, args, bot){
        if(!message.guild){
            message.channel.send("This command cannot be used in a DM or group.");
        }else if(args[1]){
           const canSpook = await bot.database.canSpook(message.author.id, message.guild.id);
            if (!canSpook) {
                message.channel.send(":ghost: You are unable to spook. Type !spook to see who is currently spooked.")
            }else if(message.content.indexOf("@everyone") > -1 || message.content.indexOf("@here") > -1){
                message.channel.send(":ghost: Seriously? You can't spook everyone....");
            }else if (!message.mentions || !message.mentions.users || message.mentions.users.size === 0) {
                message.channel.send(":ghost: To spook someone you must @mention them.");
            }else if(message.mentions.users.first().bot){
                message.channel.send(":ghost: Bots can't get spooked!");
            }else if(message.mentions.users.first().presence.status === "offline"){
                message.channel.send(":ghost: You can't spook someone who's offline!");
            }else{
                const target = message.mentions.users.first();
                // noinspection EqualityComparisonWithCoercionJS
                if(target.id == message.author.id){
                    message.channel.send(":ghost: You can't spook yourself!");
                }else {
                    const result = await bot.database.getSpookCount(target.id, message.guild.id);
                    message.channel.send(`:ghost: **<@${target.id}> has been spooked for the ${bot.util.getNumberPrefix(result[0]['COUNT(*)']+1)} time!**\nThey are now able to spook anyone else on the server.\n**The person who is spooked at midnight on the 31st of October loses!**`);
                    await bot.database.spook(target.id, message.author.id, message.guild.id, message.author.username, target.username);
                    await bot.setSpookyPresence();
                    if (bot.spooked[message.guild.id])
                        clearTimeout(bot.spooked[message.guild.id].timer);
                    bot.spooked[message.guild.id] = {
                        user: target,
                        timer: setTimeout(bot.generateNewSpook, 8.64e+7, message.guild.id) //24 Hours
                    };
                }
            }
        }else{
            const result = await bot.database.getSpooked(message.guild.id);
            if(result[0]){
                message.channel.send(`:ghost: <@${result[0].spooked}> is currently spooked.\nThey are able to spook anyone else on the server with !spook @user.\n**The person who is spooked at midnight on the 31st of October loses!**`)
            }else{
                message.channel.send(`:ghost: Nobody is currently spooked! Spook someone with !spook @user\n**The person who is spooked at midnight on the 31st of October loses!**`)
            }
        }
    }
};