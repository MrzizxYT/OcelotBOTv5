/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) base
 *  ════╝
 */
const express = require('express');
module.exports = {
    name: "Base Functions",
    base: "/",
    init: function init(broker) {
        let router = express.Router();

        router.get('/commands', function(req, res){
            res.json(broker.commandList);
        });

        router.get('/restart', function(req, res){
            res.json({});
            process.exit(0);
        });

        router.get('/warnings', function(req, res){
            res.json(broker.warnings);
        });

        router.get('/lastcrash', function(req, res){
            res.send(broker.lastCrash.getTime().toString());

        });


        return router;
    }
};