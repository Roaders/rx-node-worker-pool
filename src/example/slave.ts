
import {workerUtils} from "../lib/workerPool";

console.log(`I obey MASTER`);

process.on("message", message => {
    console.log("SLAVE: message from master: " + message);

    setTimeout(() => {
        const random = Math.random();

        if(random > 0.9){
            var error = new Error(`I am sorry MASTER, I died (${message})`);
            throw(error);
        } else if(random > 0.8){
            var error = new Error(`I am sorry MASTER, I failed (${message})`);
            workerUtils.throwError(error);
        } else {
            workerUtils.sendMessage(`I heard your message master: ${message}`);
        }

    },Math.round(Math.random()*1000))
});

workerUtils.workerReady();