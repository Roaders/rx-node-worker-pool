# rx-node-worker-pool

[![Known Vulnerabilities](https://snyk.io/test/github/roaders/rx-node-worker-pool/badge.svg)](https://snyk.io/test/github/roaders/rx-node-worker-pool)

A library for managing node workers in a reactive way.

This library lets you use the parallel processing power of multiple cores in your reactive application whilt hiding the implementation details.

## Installation

`npm install rx-node-worker-pool --save`

## Usage

### Master

```
import WorkerPool from "rx-node-worker-pool";

var arrayOfImagesToLoad = loadImages();

var loadImagePool = new WorkerPool({exec: "loadImage.js"});
var resizeImagePool = new WorkerPool({exec: "resizeImage.js}");

Rx.Observable.from(arrayOfImagesToLoad)
    .do(image => loadImagePool.doWork(image))
    .do(image => resizeImagePool.doWork(image))
    .subscribe()
```
### loadImage.js
```
import {workerUtils} from "rx-node-worker-pool";

process.on("message", message => {
    try{
        loadImage(message.image, (result) => {
            workerUtils.sendMessage(result);
        });
    } catch(error){
        //error must be an instace of Error
        workerUtils.throwError(error);
    }
});

//worker must signal that it is ready to receive work
workerUtils.workerReady();
```
### resizeImage.js
```
import {workerUtils} from "rx-node-worker-pool";

process.on("message", message => {
    try{
        resizeImage(message.image, (result) => {
            workerUtils.sendMessage(result);
        });
    } catch(error){
        workerUtils.throwError(error);
    }
});

workerUtils.workerReady();
```
## Example

An example multi-threaded app can be installed and run with the following command:

```
git clone https://github.com/Roaders/rx-node-worker-pool.git
cd rx-node-worker-pool
npm install
npm start
```
