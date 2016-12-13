
import Rx = require("rx");
import WorkerPool from "../lib/workerPool";

console.log(`I am MASTER of all I survey`);

function logProgress(){
    if(!pool.getOverallRate(5)){
        return;
    }

    const lastFive = pool.getOverallRate(5);

    console.log(`In progress: ${pool.inProgress} Last ${lastFive.count} Rate: ${lastFive.msPerItem}`);
}

const pool = new WorkerPool({ exec: "example/slave.js"},null,1000,logProgress);

function handleError(error: any){
    console.log(`Stream killing error: ${error}`);
    pool.killWorkers();
}

function handleComplete(){
    pool.killWorkers();
    console.log(`all complete`);
}

pool.createPool()
    .do(workerCount => console.log(`pool of ${workerCount} workers created`))
    .flatMap(workerCount => Rx.Observable.range(0,workerCount*2))
    .flatMap(count => {
        return pool.doWork(`are you listening slave ${count}?`)
            .retry(10);
    })
    .do(reply => console.log(`MASTER: reply from Slave: ${reply}`))
    .subscribe(
        item => {},
        error => handleError(error),
        () => handleComplete()
    );