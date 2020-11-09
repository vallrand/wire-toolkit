export function debounce<T extends Function>(callback: T, delay: number = 0): T {
    let timeout: number
    return function(this: any){
        const context = this, args = arguments
        window.clearTimeout(timeout)
        timeout = window.setTimeout(function(){
            callback.apply(context, args)
        }, delay)
    } as any
}