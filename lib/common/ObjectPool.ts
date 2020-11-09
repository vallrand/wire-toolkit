export class ObjectPool<T> {
    constructor(private readonly _factory: (index: number) => T){}
    private readonly _items: T[] = []
    private _index: number = 0
    public recycle(item: T): void {
        let index = this._items.indexOf(item)
        if(!~index) this._items.push(item)
    }
    public obtain(): T {
        return this._items.length
        ? this._items.pop() as T
        : this._factory(++this._index)
    }
}