
import {IWorkerMessage, MessageType} from "./workerPool";

export function sendMessage(messageBody: any){
    const messageWrapper: IWorkerMessage<any> = {type: MessageType.message, message: messageBody};

    process.send(messageWrapper);
}

export function throwError(error: Error){
    const messageWrapper: IWorkerMessage<string> = {type: MessageType.error, errorMessage: error.message, message: "Error" };

    process.send(messageWrapper);
}

export function workerReady(){
    sendMessage({});
}