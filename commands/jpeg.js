/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/02/2019
 * ╚════ ║   (ocelotbotv5) jpeg
 *  ════╝
 */
/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/02/2019
 * ╚════ ║   (ocelotbotv5) rotate
 *  ════╝
 */
const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "JPEG-ify",
    usage: "jpeg [url]",
    categories: ["image", "fun"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["jpeg", "jpg"],
    run: async function(message, args, bot){
        bot.util.processImageFilter(module, message, args, "quality", [message.getSetting("jpeg.quality")], "JPEG");
    }
};