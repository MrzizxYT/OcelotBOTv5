const config = require('config');
const fs = require('fs');
const async = require('async');

module.exports = {
    name: "Commands",
    init: function (bot) {
        bot.commandUsages = {};
        bot.commands = {};

        bot.prefixCache = {};



        bot.client.on("message", bot.raven.wrap(async function onMessage(message) {
            if(message.author.bot)return;
            const prefix = message.getSetting("prefix");
            const prefixLength = prefix.length;
            if(!message.content.startsWith(prefix))
                return;
            const args = message.content.split(" ");
            const command = args[0].substring(prefixLength).toLowerCase();
            if(!bot.commands[command])
                return;

            bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild ? message.guild.name : "DM Channel"} (${message.guild ? message.guild.id : "DM Channel"}) ${message.channel.name} (${message.channel.id}) performed command ${command}: ${message.content}`);

            if(bot.commandUsages[command].premium && !(message.getBool("premium") || message.getBool("serverPremium")))
                return message.channel.send(`:warning: This command requires **<:ocelotbot:533369578114514945> OcelotBOT Premium**\n_To learn more about premium, type ${message.getSetting("prefix")}premium_`);

            if(message.getBool("allowNSFW") && bot.commandUsages[command].categories.indexOf("nsfw") > -1)
                return bot.logger.log(`NSFW commands are disabled in this server (${message.guild.id}): ${message}`);

            if(message.guild && !message.channel.nsfw && bot.commandUsages[command].categories.indexOf("nsfw") > -1 &&  !message.getBool("bypassNSFWCheck"))
                return message.channel.send(`:warning: This command can only be used in NSFW channels.\nYou can bypass this check with  **${message.getSetting("prefix")}settings set bypassNSFW true**`);

            if(message.getBool(`${command}.disable`))
                return bot.logger.log(`${command} is disabled in this server: ${message}`);

            if(message.getSetting(`${command}.override`))
                return message.channel.send(message.getSetting(`${command}.override`));

            const channelDisable = message.getSetting(`${command}.channelDisable`);
            if(channelDisable && channelDisable.indexOf(message.channel.id) > -1){
                if(message.getBool("sendDisabledMessage")) {
                    const dm = await message.author.createDM();
                    dm.send(`${command} is disabled in that channel`);
                    //TODO: COMMAND_DISABLED_CHANNEL
                    bot.logger.log(`${command} is disabled in that channel (${message.channel.id})`);
                }
                return;
            }
            const channelRestriction = message.getSetting(`${command}.channelRestriction`);
            if(channelRestriction && channelRestriction.indexOf(message.channel.id) === -1){
                if(message.getBool("sendDisabledMessage")) {
                    const dm = await message.author.createDM();
                    dm.send(`${command} is disabled in that channel`);
                    //TODO: COMMAND_DISABLED_CHANNEL
                    bot.logger.log(`${command} is disabled in that channel (${message.channel.id})`);
                }
                return;
            }
            for(let i = 0; i < args.length; i++){
                if(!args[i]){
                    bot.logger.log("Removing argument "+i);
                    args.splice(i, 1);
                }
            }
            if(bot.checkBan(message)){
                bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) attempted command but is banned: ${command}: ${message.content}`);
                return;
            }
            if(bot.isRateLimited(message.author.id, message.guild ? message.guild.id : "global")){
                bot.bus.emit("commandRatelimited", command, message);
                if(bot.rateLimits[message.author.id] < message.getSetting("rateLimit.threshold")) {
                    bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) attempted command but is ratelimited: ${command}: ${message.content}`);
                    const now = new Date();
                    const timeDifference = now-bot.lastRatelimitRefresh;
                    let timeLeft = 60000-timeDifference;
                    message.replyLang("COMMAND_RATELIMIT", {timeLeft: bot.util.prettySeconds(timeLeft/1000)});
                    bot.rateLimits[message.author.id] += bot.commandUsages[command].rateLimit || 1;
                }else{
                    console.log(bot.rateLimits[message.author.id]);
                    bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) attempted command but is ratelimited: ${command}: ${message.content}`);
                }
                return;
            }
            bot.bus.emit("commandPerformed", command, message);
            try {
                bot.raven.captureBreadcrumb({
                    user: {
                        username: message.author.username,
                        id: message.author.id
                    },
                    message: message.content,
                    channel: message.channel.id,
                    server: message.guild ? message.guild.id : "DM Channel"
                });
                if(message.getSetting("notice")){
                    message.channel.send(message.getSetting("notice"));
                    bot.database.deleteSetting(message.guild.id, "notice");
                    bot.config.cache[message.guild.id].notice = null;

                }
                if (message.channel.permissionsFor && bot.commandUsages[command].requiredPermissions) {
                    bot.stats.time("commandGetPermissions");
                    const permissions = await message.channel.permissionsFor(bot.client.user);
                    bot.stats.time("commandGetPermissions");
                    if (permissions.has(bot.commandUsages[command].requiredPermissions)) {
                        bot.commands[command](message, args, bot);
                    } else if (permissions.has("SEND_MESSAGES")) {
                        let permission = "";
                        for(let i = 0; i < bot.commandUsages[command].requiredPermissions.length; i++){
                            permission += bot.util.permissionsMap[bot.commandUsages[command].requiredPermissions[i]];
                            if(i < bot.commandUsages[command].requiredPermissions.length-1)
                                permission+=", ";
                        }
                        message.replyLang("ERROR_NEEDS_PERMISSION", {permission});
                    } else {
                        const dm = await message.author.createDM();
                        dm.send("I don't have permission to send messages in that channel.");
                        //TODO: COMMAND_NO_PERMS lang key
                        bot.logger.log("No permission to send messages in this channel.");
                    }
                } else {
                    bot.commands[command](message, args, bot);
                }
            } catch (e) {
                message.channel.stopTyping(true);
                message.reply(e.toString());
                console.log(e);
                bot.raven.captureException(e);
            } finally {
                bot.database.logCommand(message.author.id, message.channel.id, message.guild ? message.guild.id : message.channel.id, message.id, command ,message.content).catch(function (e) {
                    bot.raven.captureException(e);
                    bot.logger.error(e);
                }).then(async function millionthCommandCheck(res){
                    let id = res[0];
                    if(id === 1000000){
                        bot.logger.log("1 millionth command!");
                        message.channel.send(`:tada: :tada: :tada: You just performed the **1,000,000th command on OcelotBOT!**
I hope it was a good one!
Have this <:1million:545604236826771467> exclusive badge for your **${message.getSetting("prefix")}profile**`);
                        await bot.database.giveBadge(message.author.id, 50);
                    }
                })
            }
        }));

        module.exports.loadPrefixCache(bot);
        module.exports.loadCommands(bot);
    },
    loadPrefixCache: async function(bot){

        const prefixes = await bot.database.getPrefixes();
        for(let i = 0; i < prefixes.length; i++){
            const prefix = prefixes[i];
            bot.prefixCache[prefix.server] = prefix.prefix;
        }
        bot.logger.log("Populated prefix cache with "+Object.keys(bot.prefixCache).length+" servers");
    },
    loadCommands: function (bot) {
        fs.readdir("commands", function readCommands(err, files) {
            if (err) {
                bot.logger.error("Error reading from commands directory");
                bot.logger.error(err);
                bot.raven.captureException(err);
            } else {
                async.eachSeries(files, function loadCommands(command, callback) {
                    if (!fs.lstatSync("commands/" + command).isDirectory()) {
                        let loadedCommand = require("../commands/" + command);
                        if (loadedCommand.init) {
                            try {
                                loadedCommand.init(bot);
                            }catch(e){
                                bot.raven.captureException(e);
                                bot.logger.error(e);
                                if(bot.client && bot.client.shard){
                                    bot.client.shard.send({type: "warning", payload: {
                                        id: "badInit-"+command,
                                        message: `Couldn't initialise command ${command}:\n${e.message}`
                                    }});
                                }
                            }
                        }
                        bot.logger.log(`Loaded command ${loadedCommand.name}`);

                        for (let i in loadedCommand.commands) {
                            if (loadedCommand.commands.hasOwnProperty(i)) {
                                const commandName = loadedCommand.commands[i];
                                bot.commands[commandName] = loadedCommand.run;
                                bot.commandUsages[commandName] = {
                                    id: command,
                                    name: loadedCommand.name,
                                    usage: loadedCommand.usage,
                                    requiredPermissions: loadedCommand.requiredPermissions,
                                    hidden: loadedCommand.hidden,
                                    categories: loadedCommand.categories,
                                    rateLimit: loadedCommand.rateLimit,
                                    premium: loadedCommand.premium
                                };
                            }
                        }
                    }
                    callback();
                }, function commandLoadFinished() {
                    bot.bus.emit("commandLoadFinished");
                    bot.logger.log("Finished loading commands.");

                    bot.client.shard.send({
                        type: "commandList",
                        payload: bot.commandUsages
                    })
                });
            }
        });
    }
};