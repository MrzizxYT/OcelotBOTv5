/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 19/02/2019
 * ╚════ ║   (ocelotbotv5) premium
 *  ════╝
 */
module.exports = {
    name: "Ocelot Premium",
    usage: "premium",
    commands: ["premium", "support", "donate"],
    rateLimit: 1,
    categories: ["meta"],
    init: function(bot){
        bot.client.on("ready", function startPremiumListener(){
           if(bot.client.guilds.has("322032568558026753")){
               bot.logger.log("Listening for premium changes on this shard");
               bot.client.on("guildMemberUpdate", async function guildMemberUpdate(oldMember, newMember){
                    if(oldMember.guild.id !== "322032568558026753")return;
                    if(oldMember.hoistRole && oldMember.hoistRole.name === "Premium" && (!newMember.hoistRole || newMember.hoistRole.name !== "Premium")){
                        console.log(`${oldMember} is no longer premium`);
                    }else if(newMember.hoistRole && newMember.hoistRole.name === "Premium"){
                        bot.logger.log("Found new premium subscriber "+newMember);
                        let user = newMember.user;
                        let dm = await user.createDM();
                        dm.send(`:hearts: Thank you for purchasing **Ocelot Premium**!
You now have access to the following features:
- <:premium:547494108160196624> New profile badge
- Custom profile background
- Custom profile font
- Premium profile border
- Fast track support 
- Reliable uptime
**More perks being added all the time for no additional charge!**`);

                        await bot.database.setUserSetting(user.id, "premium", 1);
                        bot.client.shard.send({type: "reloadUserConfig"});
                        await bot.database.giveBadge(user.id, 52);
                        bot.client.channels.get("322032568558026753").send(`<:ocelotbot:533369578114514945> ${user} just purchased **Ocelot Premium**! <3`);
                    }
               });
           }
        });
    },
    run: async function run(message, args){
        message.channel.send(`<:ocelotbot:533369578114514945> **Support OcelotBOT on Patreon and get Premium features: https://www.patreon.com/ocelotbot**
Joining Premium gets you:
- A chance to have your own bot ideas implemented
- <:premium:547494108160196624> New profile badge
- Custom profile background
- Custom profile font
- Premium profile border
- Fast track support 
- Reliable uptime    
Join the support server: https://discord.gg/7YNHpfF`);
    }
};