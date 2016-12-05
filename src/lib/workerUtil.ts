
import {IWorkerMessage, MessageType} from "./workerPool";

export function sendMessage<T>(messageBody: any){
    const messageWrapper: IWorkerMessage<T> = {type: MessageType.message, message: messageBody};

    process.send(messageWrapper);
}

export function throwError(error: Error){
    const messageWrapper: IWorkerMessage<string> = {type: MessageType.error, errorMessage: error.message, message: "Error" };

    process.send(messageWrapper);

}