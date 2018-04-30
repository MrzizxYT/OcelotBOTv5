module.exports = {
    name: "Compliment",
    usage: "compliment <person>",
    commands: ["compliment", "complement", "complament"],
    run: function run(message, args, bot) {
        if(!args[1]){
           message.replyLang("COMPLIMENT_NO_PERSON");
           return;
        }

        if(args[1].toLowerCase() === bot.client.user.username.toLowerCase() ||
            args[1].indexOf(bot.client.user.id) > -1 ||
            (message.guild && message.guild.me.nickname && args[1].toLowerCase() === message.guild.me.nickname.toLowerCase())){
            message.replyLang("COMPLIMENT_SELF_COMPLIMENT");
        }else{
            message.replyLang(`COMPLIMENT_${bot.util.intBetween(1,27)}`);
        }

    }
};