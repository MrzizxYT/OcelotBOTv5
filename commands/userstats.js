/**
 * Ported by Neil - 30/04/18
 */

module.exports = {
    name: "User Stats",
	usage: "userstats <user>",
	commands: ["userstats"],
    categories: ["meta"],
    run: async function run(message, args, bot) {
	   if(!args[1]){
			message.replyLang("USERSTATS_NO_USER");
		}else{
			const target = args[1].replace(/[<>@!]/g, "");
			try{
				message.channel.startTyping();
				let result = await bot.database.getUserStats(target);
				if(!result[0]){
					message.replyLang("USERSTATS_NO_COMMANDS");
				}else{
					message.replyLang("USERSTATS_MESSAGE", {target: target, count: result[0].commandCount});
				}

                message.channel.stopTyping();

			}catch(e){
				bot.raven.captureException(e);
				message.replyLang("GENERIC_ERROR");
			}
		}
    }
};