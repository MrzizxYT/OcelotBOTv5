/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 16/12/2018
 * ╚════ ║   (ocelotbotv5) vote
 *  ════╝
 */
module.exports = {
    name: "Vote For OcelotBOT",
    usage: "vote",
    rateLimit: 10,
    categories: ["meta"],
    requiredPermissions: [],
    commands: ["vote"],
    init: function(bot){
        bot.waitingVoteChannels = [];

        process.on("message", function vote(message){
           if(message.type === "vote"){
                let user = message.payload.user;
                for(let i = 0; i < bot.waitingVoteChannels.length; i++){
                    let channel = bot.waitingVoteChannels[i];
                    if(channel.members.has(user)){
                        bot.logger.log("Matched waiting vote channel for "+user);
                        channel.send(`Thanks for voting <@${user}>!\nI'd love it if you voted again tomorrow. <3`);
                        break;
                    }
                }
           }
        });
    },
    run: async function(message, args, bot){
        message.channel.send("Voting for OcelotBOT helps me grow and supports development. Click here to vote:\nhttps://discordbots.org/bot/146293573422284800/vote");
        bot.waitingVoteChannels.push(message.channel);
    }
};