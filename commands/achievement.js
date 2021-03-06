const Discord = require('discord.js');
module.exports = {
    name: "Achievement Get!",
    usage: "achievement <text>",
    rateLimit: 10,
    detailedHelp: "Creates a Minecraft-style achievement",
    usageExample: "achievement Getting Wood",
    categories: ["image", "fun", "memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["achievement", "acheivement", "ach", "achievment"],
    run:  function(message, args, bot){
        if(!args[1]){
            message.replyLang("GENERIC_TEXT", {command: args[0]});
            return;
        }

        message.channel.startTyping();
        let attachment = new Discord.Attachment((message.guild ? message.guild.getSetting("achievement.url") : bot.config.get("global", "achievement.url"))+encodeURIComponent(message.content.substring(args[0].length+1)), "ach.png");
        message.channel.send("", attachment);
        message.channel.stopTyping();
    },
    test: function(test){
        test('achievement no text', function(t){
            const args = ["achievement"];
            const message = {
                channel: {
                    send: function(message){
                        t.is(message, ":bangbang: You must provide some text! i.e !achievement hello world");
                    }
                }
            };
            module.exports.run(message, args);
        });
        test('achievement', function(t){
            const args = ["achievement", "test", "test"];
            const message = {
                channel: {
                    send: function(message, attachment){
                        t.is(attachment.file.attachment, 'https://mcgen.herokuapp.com/a.php?i=1&h=Achievement%20Get!&t=%20test%20test');
                        t.is(attachment.file.name, 'ach.png');
                    },
                    startTyping: function(){
                        t.pass();
                    },
                    stopTyping: function(){
                        t.pass();
                    }
                },
                content: "!achievement test test"
            };
            module.exports.run(message, args);
        });
    }
};