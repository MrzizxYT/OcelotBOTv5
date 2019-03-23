const gm = require('gm');
const wrap = require('word-wrap');
const Discord = require('discord.js');
const request = require('request');
const fs = require('fs');
module.exports = {
    name: "Utilities",
    init: function(bot){

        bot.util = {};

        //Someone is definitely going to tell me a different way of doing this
        bot.util.vowels = [ "a", "e", "i", "o", "u",
                            "ａ","ｅ","ｉ","ｏ","ｕ",
                            "Ａ","Ｅ","Ｉ","Ｏ","Ｕ",
                            "𝕒","𝕖","𝕚","𝕠","𝕦",
                            "ⓐ","ⓔ","ⓘ","ⓞ","ⓤ",
                            "🅐","🅔","🅘","🅞","🅤",
                            "𝐚","𝐞","𝐢","𝐨","𝐮",
                            "𝖆","𝖊","𝖎","𝖔","𝖚",
                            "𝒂","𝒆","𝒊","𝒐","𝒖",
                            "𝓪","𝓮","𝓲","𝓸","𝓾",
                            "𝖺","𝖾","𝗂","𝗈","𝗎",
                            "𝗮","𝗲","𝗶","𝗼","𝘂",
                            "𝙖","𝙚","𝙞","𝙤","𝙪",
                            "𝘢","𝘦","𝘪","𝘰","𝘶",
                            "⒜","⒠","⒤","⒪","⒰",
                            "🇦","🇪","🇮","🇴","🇺",
                            "🄰","🄴","🄸","🄾","🅄",
                            "🅰","🅴","🅸","🅾","🆄",
                            "A","ɘ","i","o","U",
                            "о"
        ];

        /**
         * Returns a random number between `min` and `max`
         * @param {Number} min
         * @param {Number} max
         * @returns {number}
         */
        bot.util.intBetween = function(min, max){
            return parseInt((Math.random() * max)+min);
        };

        /**
        * Chooses a random object from `array`
        * @param {Array} array
        * @returns {*} A random object from the specified array
        */
        bot.util.arrayRand = function arrayRand(array){
            return array[Math.round(Math.random()*(array.length-1))];
        };

        /**
         *
         * @param {Function} callback The function called once the time is up
         * @param {Number} timeout_ms The amount of milliseconds until the time should be called
         */
        bot.util.setLongTimeout = function setLongTimeout(callback, timeout_ms){
            if(timeout_ms > 2147483646){
                setTimeout(function(){
                    setLongTimeout(callback, (timeout_ms - 2147483646));
                },2147483646);
            }
            else{
                setTimeout(callback, timeout_ms);
            }
        };

        /**
         * Returns the difference between two arrays
         * @param {Array} first
         * @param {Array} second
         * @returns {Array}
         */
        bot.util.arrayDiff = function(first, second) {
            return first.filter(function(i) {return second.indexOf(i) < 0;});
        };

        /**
         * Randomly shuffles an array
         * @param {Array} a
         */
        bot.util.shuffle = function shuffle(a) {
            var j, x, i;
            for (i = a.length; i; i--) {
                j = Math.floor(Math.random() * i);
                x = a[i - 1];
                a[i - 1] = a[j];
                a[j] = x
            }
        };

        /**
         *
         * @param {Array} data
         * @param {String} unit
         * @param {Number} value
         * @returns {Array}
         */
        bot.util.quantify = function quantify(data, unit, value) {
            if (value && value >= 1) {
                if (value > 1 || value < -1)
                    unit += 's';

                data.push(value + ' ' + unit);
            }

            return data;
        };

        /**
         * Parses a number of seconds as a proper time
         * @param {Number} seconds
         * @returns {String}
         */
        bot.util.prettySeconds = function prettySeconds(seconds) {

            var prettyString = '',
                data = [];

            if (typeof seconds === 'number') {
                data = bot.util.quantify(data, 'day',    parseInt((seconds) / 86400));
                data = bot.util.quantify(data, 'hour',   parseInt((seconds % 86400) / 3600));
                data = bot.util.quantify(data, 'minute', parseInt((seconds % 3600) / 60));
                data = bot.util.quantify(data, 'second', Math.floor(seconds % 60));

                var length = data.length,
                    i;

                for (i = 0; i < length; i++) {

                    if (prettyString.length > 0)
                        if (i == length - 1)
                            prettyString += ' and ';
                        else
                            prettyString += ', ';

                    prettyString += data[i];
                }
            }

            return prettyString;
        };

        /**
         * Format memory as a string
         * @param {Number} bytes The number of Bytes
         * @returns {string}
         */
        bot.util.prettyMemory = function prettyMemory(bytes){
            if(bytes < 1000)return bytes+" bytes"; //< 1kb
            if(bytes < 1000000)return parseInt(bytes/1000)+"KB"; //<1mb
            if(bytes < 1e+9)return parseInt(bytes/1000000)+"MB"; //<1gb
            if(bytes < 1e+12)return parseInt(bytes/1e+9)+"GB"; //<1tb
            if(bytes < 1e+15)return parseInt(bytes/1e+12)+"TB"; //<1pb
            return parseInt(bytes/1e+15)+"PB";
        };

        /**
         *
         * @param {Function} func
         * @param {Number} wait
         * @param {Boolean} immediate
         * @returns {Function}
         */        bot.bans = {
          user: [],
          channel: [],
          server: []
        };
        bot.util.debounce = function debounce(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this
                    , args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate)
                        func.apply(context, args)
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow)
                    func.apply(context, args)
            }
        };

        /**
         *
         * @param {Function} fn
         * @param {Number} threshhold
         * @param {*} scope
         * @returns {Function}
         */
        bot.util.throttle = function throttle(fn, threshhold, scope) {
            threshhold || (threshhold = 250);
            var last, deferTimer;
            return function() {
                var context = scope || this;
                var now = +new Date
                    , args = arguments;
                if (last && now < last + threshhold) {
                    clearTimeout(deferTimer);
                    deferTimer = setTimeout(function() {
                        last = now;
                        fn.apply(context, args)
                    }, threshhold)
                } else {
                    last = now;
                    fn.apply(context, args)
                }
            }
        };

        /**
         * Separate an array into chunks
         * @param {Array} a
         * @param {Number} n
         * @param {Boolean} balanced
         * @returns {Array<Array>}
         */
        bot.util.chunkify = function chunkify(a, n, balanced) {

            if (n < 2)
                return [a];

            var len = a.length,
                out = [],
                i = 0,
                size;

            if (len % n === 0) {
                size = Math.floor(len / n);
                while (i < len) {
                    out.push(a.slice(i, i += size));
                }
            }

            else if (balanced) {
                while (i < len) {
                    size = Math.ceil((len - i) / n--);
                    out.push(a.slice(i, i += size));
                }
            }

            else {

                n--;
                size = Math.floor(len / n);
                if (len % size === 0)
                    size--;
                while (i < size * n) {
                    out.push(a.slice(i, i += size));
                }
                out.push(a.slice(size * n));

            }

            return out;
        };

        /**
         *
         * @param {String} message
         * @param {Array<String>} args
         * @param {Number} x The x position of the text
         * @param {Number} y The y position of the text
         * @param {Number} textSize The Size of the text
         * @param {Number} textWidth The Width of the text lines
         * @param {String} fileName The name of the uploaded file
         * @param {String} filePath The path of the template
         */
        bot.util.processImageMeme = function processImageMeme(message, args, x, y, textSize, textWidth, fileName, filePath){
            if(!args[1]){
                message.replyLang("IMAGE_NO_TEXT");
                return;
            }

            message.channel.startTyping();
            gm(filePath)
                .font("static/arial.ttf", textSize)
                .drawText(x, y, wrap(message.cleanContent.substring(args[0].length).substring(0,1010), {width: textWidth, indent: ''}))
                .toBuffer('PNG', function convertToPNG(err, buffer){
                    if(err){
                        message.replyLang("GENERIC_ERROR");
                        bot.logger.log(err);
                        bot.raven.captureException(err);
                    }else{
                        const attachment = new Discord.Attachment(buffer, fileName);
                        message.channel.send("", attachment);
                    }
                    message.channel.stopTyping();
                });
        };

        /**
         *
         * @param module The command module
         * @param message The input message
         * @param args The input arguments
         * @param filter The desired GM filter
         * @param input The input arguments
         * @param format The output format
         * @returns {Promise<*|void|Promise<*>>}
         */
        bot.util.processImageFilter = async function processImageFilter(module, message, args, filter, input, format = "PNG"){
            const url =  await bot.util.getImage(message, args);
            if(!url || !url.startsWith("http"))
                return message.replyLang("GENERIC_NO_IMAGE", {usage: module.exports.usage});

            bot.logger.log(url);

            const fileName = `temp/${Math.random()}.png`;
            let shouldProcess = true;

            request(url)
            .on("response", function requestResponse(resp){
                shouldProcess = !(resp.headers && resp.headers['content-type'] && resp.headers['content-type'].indexOf("image") === -1);
            })
            .on("error", function requestError(err){
                bot.raven.captureException(err);
                bot.logger.log(err);
                shouldProcess = false;
            })
            .on("end", function requestEnd(){
                if(!shouldProcess){
                    message.channel.send(":warning: The URL entered is not an image URL. Please try an image or a @user.");
                    fs.unlink(fileName, function(){});
                    return;
                }
                const initialProcess = gm(fileName).autoOrient();
                initialProcess[filter].apply(initialProcess, input)
                    .toBuffer(format, function toBuffer(err, buffer){
                        if(err)
                            return message.channel.send(":warning: Couldn't create image - did you enter an image URL?");
                        let name = filter+".png";
                        if(url.indexOf("SPOILER_") > -1)
                            name = "SPOILER_"+name;
                        const attachment = new Discord.Attachment(buffer, name);
                        message.channel.send("", attachment).catch(function sendMessageError(e){
                            console.log(e);
                            message.channel.send("Upload error: "+e);
                        });
                        fs.unlink(fileName, function(){});
                    });
            }).pipe(fs.createWriteStream(fileName));
        };

        String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
            function () {
                "use strict";
                let str = this.toString();
                if (arguments.length) {
                    let t = typeof arguments[0];
                    let key;
                    let args = ("string" === t || "number" === t) ?
                        Array.prototype.slice.call(arguments)
                        : arguments[0];

                    for (key in args) {
                        str = str.replace(new RegExp("\\{{" + key + "\\}}", "gi"), args[key]);
                    }
                }

                return str;
            };

        /**
         * Get an image for use in meme templates
         * @param {Object} message The message object
         * @param {Array<String>} args
         * @returns {Promise.<*>}
         */
        bot.util.getImage = async function getImage(message, args){
            try {
                if (message.mentions && message.mentions.users && message.mentions.users.size > 0) {
                    return message.mentions.users.first().avatarURL;
                } else if (args[2] && args[2].indexOf("http") > -1) {
                    return args[2]
                } else if (args[1] && args[1].indexOf("http") > -1) {
                    return args[1];
                } else {
                    message.channel.startTyping();
                    const result = bot.util.getImageFromPrevious(message);
                    message.channel.stopTyping();
                    return result;
                }
            }catch(e){
                bot.raven.captureException(e);
                return null;
            }

        };

        /**
         * Get an image from previous messages
         * @param {Object} message
         * @returns {Promise.<*>}
         */
        bot.util.getImageFromPrevious = async function getImageFromPrevious(message){
            const previousMessages = (await message.channel.fetchMessages({limit: 50})).sort((a, b) => b.createdTimestamp - a.createdTimestamp);
            const targetMessage = previousMessages.find((previousMessage) =>{
                if(previousMessage.content.startsWith("http"))return true;
                if(previousMessage.attachments && previousMessage.attachments.size > 0)return true;
                return (previousMessage.embeds && previousMessage.embeds.length > 0);
            });
            if(targetMessage){
                if(targetMessage.content.startsWith("http")) {
                    return targetMessage.content.split(" ")[0];
                }else if(targetMessage.attachments && targetMessage.attachments.size > 0){
                    const targetAttachment = targetMessage.attachments.find((attachment)=>(attachment.url || attachment.proxyURL));
                    if(!targetAttachment)return null;
                    return targetAttachment.url || targetAttachment.proxyURL;
                }else if(targetMessage.embeds && targetMessage.embeds.length > 0){
                     const targetEmbed = targetMessage.embeds.find(function (embed) {
                         return embed.image && (embed.image.url || embed.image.proxyURL)
                    });
                     if(!targetEmbed)return null;
                     return targetEmbed.image.url || targetEmbed.image.proxyURL;
                }
                return null;
            }else{
                return null;
            }
        };

        Object.defineProperty(Array.prototype, 'chunk', {
            value: function(chunkSize) {
                var R = [];
                for (var i=0; i<this.length; i+=chunkSize)
                    R.push(this.slice(i,i+chunkSize));
                return R;
            }
        });

        /**
         * Get the prefix for numbers e.g 1st 2nd 3rd
         * @param {Number} i
         * @returns {string}
         */
        bot.util.getNumberPrefix = function getNumberPrefix(i){
            let j = i % 10,
                k = i % 100;
            if (j === 1 && k !== 11) {
                return i + "st";
            }
            if (j === 2 && k !== 12) {
                return i + "nd";
            }
            if (j === 3 && k !== 13) {
                return i + "rd";
            }
            return i + "th";
        };



        bot.util.permissionsMap = {
            ADMINISTRATOR: "Administrator",
            CREATE_INSTANT_INVITE: "Create Instant Invite",
            KICK_MEMBERS: "Kick Members",
            BAN_MEMBERS: "Ban Members",
            MANAGE_CHANNELS: "Manage Channels",
            MANAGE_GUILD: "Manage Server",
            ADD_REACTIONS: "Add Reactions",
            VIEW_AUDIT_LOG: "View Audit Log",
            PRIORITY_SPEAKER: "Priority Speaker",
            VIEW_CHANNEL: "Read Messages",
            READ_MESSAGES: "Read Messages",
            SEND_MESSAGES: "Send Messages",
            SEND_TTS_MESSAGES: "Send TTS",
            MANAGE_MESSAGES: "Manage Messages",
            EMBED_LINKS: "Embed Links",
            ATTACH_FILES: "Attach Files",
            READ_MESSAGE_HISTORY: "Read Message History",
            MENTION_EVERYONE: "Mention Everyone",
            USE_EXTERNAL_EMOJIS: "Use External Emojis",
            CONNECT: "Connect to Voice Channel",
            SPEAK: "Speak in Voice Channels",
            MUTE_MEMBERS: "Mute Members in Voice Channels",
            DEAFEN_MEMBERS: "Deafen Members in Voice Channels",
            MOVE_MEMBERS: "Move Members in Voice Channels",
            USE_VAD: "Use Voice Activity",
            CHANGE_NICKNAME: "Change Nickname",
            MANAGE_NICKNAMES: "Manage Nicknames",
            MANAGE_ROLES_OR_PERMISSIONS: "Manage Roles",
            MANAGE_WEBHOOKS: "Manage Webhooks",
            MANAGE_EMOJIS: "Manage Emojis"
        };


        const mainChannelRegex = /main|general|discussion|home|lobby/gi;
        const secondaryChannelRegex = /bot.*|spam|off-topic/gi;
        const requiredPermissions = ["SEND_MESSAGES", "READ_MESSAGES", "VIEW_CHANNEL"];

        bot.util.determineMainChannel = function determineMainChannel(guild){
            if(guild.defaultChannel && guild.defaultChannel.type === "text" && guild.defaultChannel.permissionsFor(bot.client.user).has(requiredPermissions, true)){
                return guild.defaultChannel;
            }

            let channels = guild.channels;

            let mainChannel = channels.find(function(channel){
                return channel.type === "text" && channel.name.match(mainChannelRegex) && channel.permissionsFor(bot.client.user).has(requiredPermissions, true)
            });

            if(mainChannel){
                return mainChannel;
            }

            let secondaryChannel = channels.find(function(channel){
                return channel.type === "text" && channel.name.match(requiredPermissions) && channel.permissionsFor(bot.client.user).has(requiredPermissions, true)
            });

            if(secondaryChannel){
                return secondaryChannel;
            }

            return channels.find(function(channel){
                return channel.type === "text" &&channel.permissionsFor(bot.client.user).has(requiredPermissions, true);
            });
        };

        bot.util.getUserFromMention = function getUserFromMention(mention) {
            if (!mention) return null;

            if (mention.startsWith('<@') && mention.endsWith('>')) {
                mention = mention.slice(2, -1);

                if (mention.startsWith('!')) {
                    mention = mention.slice(1);
                }

                return bot.client.users.get(mention);
            }

            return null;

        };

        /**
         * The standard reaction pages used in most paginated commands
         * @param {TextChannel} channel Target Channel
         * @param {Array} pages The array of page data
         * @param {function} formatMessage The function for building the pages
         * @param {boolean} fullReactions Whether or not to use first/last page reactions
         * @param {Number} reactionTime
         * @returns {Promise<void>}
         */
        bot.util.standardPagination = async function(channel, pages, formatMessage, fullReactions = false, reactionTime = 60000){
            let index = 0;
            let sentMessage;

            let buildPage = async function () {
               let output = await formatMessage(pages[index], index);
                if(sentMessage)
                    await sentMessage.edit(output);
                else
                    sentMessage = await channel.send(output);
            };

            await buildPage();

            if(pages.length === 1)
                return;

            (async function () {
                if(fullReactions)
                    await sentMessage.react("⏮");
                await sentMessage.react("◀");
                await sentMessage.react("▶");
                if(fullReactions)
                    await sentMessage.react("⏭");
            })();

            await sentMessage.awaitReactions(async function (reaction, user) {
                if (user.id === bot.client.user.id) return false;
                switch (reaction.emoji.name) {
                    case "⏮":
                        index = 0;
                        await buildPage();
                        break;
                    case "◀":
                        if (index > 0)
                            index--;
                        else
                            index = pages.length - 1;
                        await buildPage();
                        break;
                    case "▶":
                        if (index < pages.length - 1)
                            index++;
                        else
                            index = 0;
                        await buildPage();
                        break;
                    case "⏭":
                        index = pages.length - 1;
                        await buildPage();
                        break;
                }
                reaction.remove(user);

            }, {time: reactionTime});
            if(!sentMessage.deleted) {
                bot.logger.log(`Reactions on ${sentMessage.id} have expired.`);
                sentMessage.clearReactions();
            }else{
                bot.logger.log(`${sentMessage.id} was deleted before the reactions expired.`);
            }
        };


        bot.util.nestedCommands = {};

        bot.util.standardNestedCommandInit = function standardNestedCommandInit(id, directory = id){
            bot.logger.log(`Initialising nested commands for ${id}`);
            fs.readdir(`commands/${directory}`, function loadNestedCommands(err, files){
                if(err){
                    bot.raven.captureException(err);
                    bot.logger.log(`Unable to read ${id} command dir (${directory})`);
                    bot.logger.log(err);
                }else{
                    bot.util.nestedCommands[id] = {};
                    for(let i = 0; i < files.length; i++){
                        try{
                            const command = require(`../commands/${directory}/${files[i]}`);
                            bot.logger.log(`Loaded ${id} command ${command.name}`);
                            for(let c = 0; c < command.commands.length; c++){
                                bot.util.nestedCommands[id][command.commands[c]] = command;
                                if(command.init){
                                    bot.logger.log(`Performing init for ${id} command ${command.name}`);
                                    command.init(bot);
                                }
                            }
                        }catch(e){
                            bot.raven.captureException(e);
                            bot.logger.log(`Error loading ${id} command for ${files[i]}: ${e}`);
                        }
                    }
                }
            });
        };

        bot.util.standardNestedCommand = function standardNestedCommand(message, args, bot, id){
            const commandName = args[1] && args[1].toLowerCase();
            const commandType = bot.util.nestedCommands[id];
            const command = commandType[commandName];
            if(command){
                command.run(message, args, bot);
            }else if(commandName === "help"){
                let output = "```asciidoc\nAvaiable Commands\n";
                let usedAliases = [];
                for(let helpItemName in commandType){
                    if(!commandType.hasOwnProperty(helpItemName))continue;
                    const helpItem = commandType[helpItemName];
                    if(usedAliases.indexOf(helpItem.commands[0]) > -1)continue;
                    if(!helpItem.hidden)
                        output += `${helpItem.name} :: ${args[0]} ${helpItem.commands[0]}\n`;
                    usedAliases.push.apply(usedAliases, helpItem.commands);
                }
                output += "\n```";
                message.channel.send(output);
            }else{
                message.channel.send(`:bangbang: Invalid usage. Try ${args[0]} help`);
            }
        }

    }
};