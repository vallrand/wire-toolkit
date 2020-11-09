import { single } from './single'

type IHandler = (release: () => void) => void

export function Lock(){
    const queue: IHandler[] = []
    let locked: boolean = false
    function release(): void {
        const handler = queue.shift()
        if(handler){
            locked = true
            handler(single(release))
        }else locked = false
    }
    return function aquire(callback: IHandler): void {
        queue.push(callback)
        if(!locked) release()
    }
}