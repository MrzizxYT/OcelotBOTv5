/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 24/04/2019
 * ╚════ ║   (ocelotbotv5) icetext
 *  ════╝
 */
const request = require('request');
module.exports = {
    name: "Ice Text Generator",
    usage: "icetext <text>",
    categories: ["text"],
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["icetext", "ice"],
    run:  function(message, args, bot){
        if(!args[1]){
            message.replyLang("GENERIC_TEXT", {command: args[0]});
            return;
        }


        const text = message.cleanContent.substring(args[0].length+1);

        message.channel.startTyping();

        request.post({
            method: "POST",
            url: "https://cooltext.com/PostChange",
            headers: {
                'content-type': "application/x-www-form-urlencoded; charset=UTF-8"
            },
            form: {
                LogoID: 1779834160,
                Text: text,
                FontSize: 70,
                FileFormat: 6,
                BackgroundColor_color: "#FFFFFF"
            }
        }, function(err, resp, body){
            if(err){
                console.log(err);
                bot.raven.captureException(err);
                message.channel.stopTyping(true);
                return message.replyLang("GENERIC_ERROR");
            }
            try{
                let data = JSON.parse(body);
                if(data.renderLocation) {
                    message.channel.send("", {
                        embed: {
                            image: {
                                url: data.renderLocation.replace(/ /g, "%20") //Eat a dick
                            }
                        }
                    });
                }else {
                    message.replyLang("GENERIC_ERROR");
                    bot.logger.warn("Invalid Response?");
                    bot.logger.warn(body);
                }
            }catch(e){
                bot.raven.captureException(e);
                bot.logger.error(e);
                console.log(e);
                console.log("Body:", body);
                message.replyLang("GENERIC_ERROR");
            }finally{
                message.channel.stopTyping();
            }
        });
    }
};