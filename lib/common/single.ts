export function single<T extends Function>(callback: T): T {
    let value: any
    return function(this: any){
        if(callback){
            value = callback.apply(this, arguments)
            callback = null as any
        }
        return value
    } as any
}