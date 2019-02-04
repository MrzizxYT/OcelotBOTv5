module.exports = {
    name: "Set Presence",
    usage: "setPresence [message]",
    commands: ["setpresence"],
    run:  async function(message, args, bot){
        if(bot.client.shard){
            bot.client.shard.send({type: "presence", payload: message.content.substring(message.content.indexOf(args[2]))})
        }else{
            bot.presenceMessage = args[3] === "clear" ? null : message.content.substring(message.content.indexOf(args[2]));
            const serverCount   = (await bot.client.shard.fetchClientValues("guilds.size")).reduce((prev, val) => prev + val, 0);
            bot.client.user.setPresence({
                game: {
                    name: `${bot.presenceMessage && bot.presenceMessage + " | "} ${serverCount} servers.`,
                    type: "LISTENING"
                }
            });
        }
    }
};