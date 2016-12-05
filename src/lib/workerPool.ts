
import os = require('os');
import cluster = require('cluster');
import Rx = require("rx");

export enum MessageType{
    message,
    error
}

export interface IWorkerMessage<T>{
    type: MessageType;
    message: T;
    errorMessage?: string;
}

export default class WorkerPool{

    constructor(private _settings?: cluster.ClusterSetupMasterSettings, private _maxWorkers?: number, private _workerTimeout: number = 500){
    }

    static numberOfCores(): number{
        return process.env.NUMBER_OF_PROCESSORS ? process.env.NUMBER_OF_PROCESSORS : os.cpus.length;
    }

    private _allWorkers: cluster.Worker[] = [];
    private _availableWorkers: cluster.Worker[] = [];
    private _waitingForWorkers: Rx.Subject<cluster.Worker>[] = [];

    //  Public Methods

    public createPool(): Rx.Observable<number>{
        const cpuCount = WorkerPool.numberOfCores();
        const workerCount = this._maxWorkers == null ? cpuCount : Math.min(this._maxWorkers,cpuCount);

        return Rx.Observable.range(0, workerCount)
            .flatMap(() => this.createWorker())
            .count();
    }

    public doWork<T>(message: any): Rx.Observable<T>{
        return Rx.Observable.defer(() => {
            return this.getWorker()
                .flatMap(worker => {

                    const disconnectStream = this.createWorkerDosconnectStream(worker);

                    const messageStream = this.createWorkerMessageStream<T>(worker)

                    worker.send(message);
                    
                    return messageStream.merge(disconnectStream)
                        .take(1);
                });
        });
    }

    public killWorkers(){
        this._allWorkers.forEach(worker => worker.kill())
    }

    //  Private Methods

    private createWorkerDosconnectStream(worker: cluster.Worker){
        return Rx.Observable.fromEvent(<any>worker,"disconnect")
            .flatMap(() => {
                console.log(`Error doing work: Worker Diconnected`);

                const index = this._allWorkers.indexOf(worker);
                this._allWorkers.splice(index,1);

                return this.createWorker()
                    .flatMap(() => Rx.Observable.throw(new Error("Worked disconnected")));
            });
    }

    private createWorkerMessageStream<T>(worker: cluster.Worker){
        return Rx.Observable.fromEvent<IWorkerMessage<T>>(<any>worker,"message")
            .flatMap(messageWrapper => {
                this.addAvailableWorker(worker);

                if(messageWrapper.type === MessageType.error)
                {
                    console.log(`Error doing work: ${messageWrapper.errorMessage}`);
                    return Rx.Observable.throw<T>(new Error(messageWrapper.errorMessage));
                } else {
                    return Rx.Observable.return(messageWrapper.message);
                }
            });
    }

    private createWorker(): Rx.Observable<cluster.Worker>{
        return Rx.Observable.defer(() => {
            if(this._settings){
                cluster.setupMaster(this._settings);
            }

            const worker = cluster.fork();
            this._allWorkers.push(worker);

            return Rx.Observable.fromEvent(<any>worker,"message")
                .timeout(this._workerTimeout, Rx.Observable.throw(new Error(`Timeout waiting for message from worker. A worker must send a message when it is ready.`)))
                .take(1)
                .do(() => this.addAvailableWorker(worker))
                .map<cluster.Worker>(() => worker);
        });
    }

    private getWorker(): Rx.Observable<cluster.Worker>{
        if(this._availableWorkers.length > 0){
            return Rx.Observable.return(this._availableWorkers.pop())
        } else {
            const workerSubject = new Rx.Subject<cluster.Worker>();
            this._waitingForWorkers.push(workerSubject);
            return workerSubject;
        }
    }

    private addAvailableWorker(worker: cluster.Worker){
        if(this._waitingForWorkers.length > 0){
            const subject = this._waitingForWorkers.shift();
            subject.onNext(worker);
            subject.onCompleted();
        }
        else {
            this._availableWorkers.push(worker);
        }
    }

}

import * as workerUtils from "./workerUtil";

export { workerUtils }