import { MutableRefObject } from 'react';

export class DebugLogger {
    private debugModeRef: MutableRefObject<boolean>;

    constructor(debugModeRef: MutableRefObject<boolean>) {
        this.debugModeRef = debugModeRef;
    }

    log(message: string, ...args: any[]) {
        if (this.debugModeRef.current) {
            console.log(message, ...args);
        }
    }

    warn(message: string, ...args: any[]) {
        if (this.debugModeRef.current) {
            console.warn(message, ...args);
        }
    }

    error(message: string, ...args: any[]) {
        console.error(message, ...args);
    }
}
