
import cluster = require('cluster');
import * as workerUtil from "../lib/workerUtil";

console.log(`I obey MASTER`);

process.on("message", message => {
    console.log("SLAVE: message from master: " + message);

    setTimeout(() => {

        const random = Math.random();

        if(random > 0.9){
            var error = new Error(`I am sorry MASTER, I died (${message})`);
            //console.log(`SLAVE: throwing new error: ${error}`);

            throw(error);
        } else if(random > 0.8){
            var error = new Error(`I am sorry MASTER, I failed (${message})`);
            //console.log(`SLAVE: sending new error: ${error}`);

            workerUtil.throwError(error);
        } else {
            workerUtil.sendMessage(`I heard your message master: ${message}`);
        }

    },Math.round(Math.random()*1000))
});

process.send("ready");