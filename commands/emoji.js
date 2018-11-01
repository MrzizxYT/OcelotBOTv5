module.exports = {
    name: "Emoji Search",
    usage: "emoji <term>",
    categories: ["fun","tools"],
    requiredPermissions: [],
    commands: ["emoji", "emojisearch", "emojis"],
    run: async function(message, args, bot){
        if(!args[1]){
            message.channel.send("Usage: !emoji <term> e.g !emoji thonk");
        }else{
            let output = "";
            let emojiCount = 0;
            bot.client.emojis.forEach(function(emoji){
                if(emoji.requiresColons && emoji.name.toLowerCase().indexOf(args[1].toLowerCase()) > -1 && output.length <= 1900 && emojiCount < 10){
                    emojiCount++;
                    output +=  emoji+" ";
                }
            });
            if(output)
                message.channel.send(output);
            else
                message.channel.send("No emojis found");
        }
    }
};