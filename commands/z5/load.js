let fs = require("fs");

module.exports = {
    name: "Load",
    usage: "load <save name>",
    commands: ["load"],
    run: async function(message, args, bot, data){
        try {
            message.channel.send("Attempting restore");
            data.games[data.id].setSerialData(new Uint8Array(fs.readFileSync("./z5saves/" + args[3], {})));
            message.channel.send("Load done.");
        } catch (e) {
            console.log(e);
            message.channel.send("Restore failed.");
            return null;
        }
    }
};