import { Deferred } from './Deferred'

interface IListener<T> {
    (value: T): void
    single?: boolean
}

export class Broadcaster {
    private readonly _listeners: Record<string, IListener<any>[]> = Object.create(null)
    private readonly _iterator: { index: number, address: string }[] = []
    public dispatchEvent<T>(address: string, payload: T): this {
        const listeners: IListener<T>[] = this._listeners[address]
        if(listeners){
            const iterator = { index: 0, address }
            this._iterator.push(iterator)
            for(iterator.index = listeners.length - 1; iterator.index >= 0; iterator.index--){
                const listener = listeners[iterator.index]
                if(listener.single) this.removeEventListener(address, listener)
                listener(payload)
            }
            this._iterator.length--
        }
        return this
    }
    public addEventListener<T>(address: string, listener: IListener<T>, options?: { single?: boolean, local?: boolean }): this {
        const listeners: IListener<T>[] = this._listeners[address] = this._listeners[address] || []
        if(~listeners.indexOf(listener)) return this
        Object.assign(listener, { local: true, single: false }, options)
        listeners.push(listener)
        return this
    }
    public removeEventListener<T>(address: string, listener?: IListener<T>): this {
        const listeners: IListener<T>[] = this._listeners[address]
        if(!listeners) return this
        if(!listener)
            listeners.length = 0
        else{
            let index = listeners.indexOf(listener)
            if(!~index) return this
            listeners.splice(index, 1)
            for(let i = this._iterator.length - 1; i >= 0; i--)
                if(this._iterator[i].address === address && index < this._iterator[i].index)
                    this._iterator[i].index--
        }
        if(!listeners.length)
            delete this._listeners[address]
        return this
    }
    public promisify<T>(address: string): PromiseLike<T> {
        const deferred = new Deferred<T>()
        this.addEventListener(address, deferred.resolve, { single: true })
        return deferred
    }
}