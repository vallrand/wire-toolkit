export const enum DeferredStatus {
    PENDING = 0x01,
    RESOLVED = 0x02,
    REJECTED = 0x04
}

export class Deferred<T> implements PromiseLike<T> {
    private _status: DeferredStatus = DeferredStatus.PENDING
    private _value: T | any
    private readonly _listeners: Array<(status: DeferredStatus, value: T | any) => void> = []
    resolve = (value: T | PromiseLike<T>): void => this._settle(DeferredStatus.RESOLVED, value)
    reject = (reason: any): void => this._settle(DeferredStatus.REJECTED, reason)
    private _settle(status: DeferredStatus, value: T | PromiseLike<T> | any): void {
        if(this._status !== DeferredStatus.PENDING) return
        if(value && value.then) value.then(this.resolve, this.reject)
        else{
            this._status = status
            this._value = value
            for(let i = 0; i < this._listeners.length; i++)
                this._listeners[i](status, value)
            this._listeners.length = 0
        }
    }
    public then<RT = T, RF = never>(
        onResolve?: (value: T) => RT | PromiseLike<RT>,
        onReject?: (reason: any) => RF | PromiseLike<RF>
    ): Deferred<RT | RF> {
        const next = new Deferred<RT | RF>()
        function listener(status: DeferredStatus, value: T | any){
            try{
                if(status === DeferredStatus.RESOLVED)
                    next.resolve(onResolve ? onResolve(value) : value)
                else if(status === DeferredStatus.REJECTED)
                    if(onReject) next.resolve(onReject(value))
                    else throw value
            }catch(error: any){
                next.reject(error)
            }
        }
        if(this._status !== DeferredStatus.PENDING) listener(this._status, this._value)
        else this._listeners.push(listener)
        return next
    }
}