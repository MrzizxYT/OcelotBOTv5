const Discord = require('discord.js');

module.exports = {
    name: "Print",
    usage: "print <text>",
    commands: ["print"],
    run: async function(message, args, bot, data){
        Object.keys(data.games).forEach(function (key) {
            data.printHeader[key] = Discord.escapeMarkdown(args.slice(3).join(" "));
        });
        message.channel.send("Printing " + args.slice(3).join(" "));
    }
};