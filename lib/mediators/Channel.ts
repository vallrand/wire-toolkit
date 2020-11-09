interface IListener<T> {
    (value: T): void
    single?: boolean
}

export class Channel<T> {
    private _value: T | void = undefined
    private readonly _listeners: IListener<T>[] = []
    private readonly _iterator: number[] = []
    public get value(): T | void { return this._value }
    public addListener(listener: IListener<T>, options?: { single: boolean }): this {
        const index = this._listeners.indexOf(listener)
        if(~index) return this
        Object.assign(listener, options)
        this._listeners.push(listener)
        return this
    }
    public removeListener(listener: IListener<T>): this {
        const index = this._listeners.indexOf(listener)
        if(!~index) return this
        this._listeners.splice(index, 1)
        for(let i = this._iterator.length - 1; i >= 0; i--)
            if(index < this._iterator[i]) this._iterator[i]--
        return this
    }
    public dispatch(value: T): this {
        this._value = value
        const depth = this._iterator.length
        for(this._iterator[depth] = this._listeners.length - 1; this._iterator[depth] >= 0; this._iterator[depth]--){
            const listener = this._listeners[this._iterator[depth]]
            if(listener.single) this.removeListener(listener)
            listener.call(this, value)
        }
        this._iterator.length--
        return this
    }
}