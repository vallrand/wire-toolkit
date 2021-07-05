export class DataStore {
    private readonly _tempData: Record<string, any> = Object.create(null)
    constructor(private readonly _prefix: string = ''){}
    public get<T>(key: string): T {
        key = `${this._prefix}${key}`
        try{
            return JSON.parse(localStorage.getItem(key)!!)
        }catch(error){
            return this._tempData[key]
        }
    }
    public set(key: string, value: any): void {
        key = `${this._prefix}${key}`
        try{
            if(value != null)
                localStorage.setItem(key, JSON.stringify(value, null, 0))
            else
                localStorage.removeItem(key)
        }catch(error){
            this._tempData[key] = value
        }
    }
    public addListener(key: string, handler: (next: any, prev: any) => void): void {
        key = `${this._prefix}${key}`
        addEventListener('storage', (event: StorageEvent) => {
            if(key !== event.key) return
            handler.call(this, JSON.parse(event.newValue!!), JSON.parse(event.oldValue!!))
        })
    }
}