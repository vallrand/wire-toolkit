import { Deferred, DeferredStatus } from './Deferred'

type RequestHandler<T, R = void> = (request: T) => R | PromiseLike<R>
type ResponseHandler<T, K, R = void> = (request: T, response: K) => R | PromiseLike<R>
type ErrorHandler<T, K, R = void> = (request: T, response: K, error: any) => R | PromiseLike<R>
interface SubscribeOptions {
    filter?: number
    priority?: number
    single?: boolean
}
type Subscriber<T=any,K=any,R=K> = (RequestHandler<T,R> | ResponseHandler<T,K,R> | ErrorHandler<T,K,R>) & SubscribeOptions

export class AsyncMediator {
    private static readonly comparePriority = (a: SubscribeOptions, b: SubscribeOptions): number => (a.priority || 0) - (b.priority || 0)
    private static readonly filter = [
        DeferredStatus.PENDING | DeferredStatus.RESOLVED | DeferredStatus.REJECTED,
        DeferredStatus.PENDING,
        DeferredStatus.RESOLVED,
        DeferredStatus.REJECTED
    ]
    private readonly _subscribers: Record<string, Subscriber[]> = Object.create(null)

    public dispatch<T,R>(address: string, request: T): PromiseLike<R> {
        const subscribers: Subscriber[] = this._subscribers[address] || []
        const queue: Subscriber[] = subscribers.slice()
        const complete = new Deferred<R>()
        function next(status: DeferredStatus, response: R, error?: any): void {
            const subscriber = queue.shift() as Subscriber<T,R,any>
            if(!subscriber) return status === DeferredStatus.REJECTED
            ? complete.reject(error) : complete.resolve(response)
            const index = subscribers.indexOf(subscriber)

            if(!~index || !(status & subscriber.filter as number)) return next(status, response, error)
            if(subscriber.single) subscribers.splice(index, 1)

            const deferred = new Deferred<void>()
            deferred.resolve()
            deferred.then(function(){
                switch(status){
                    case DeferredStatus.PENDING:
                        return (subscriber as RequestHandler<T, R>)(request)
                    case DeferredStatus.RESOLVED:
                        return (subscriber as ResponseHandler<T, R, any>)(request, response)
                    case DeferredStatus.REJECTED:
                        return (subscriber as ErrorHandler<T, R, any>)(request, response, error)
                }
            }).then(
                nextResponse => next(
                    DeferredStatus.PENDING && nextResponse === undefined
                    ? DeferredStatus.PENDING
                    : DeferredStatus.RESOLVED,
                    nextResponse === undefined ? response : nextResponse, error
                ),
                error => next(DeferredStatus.REJECTED, response, error)
            )
        }
        next(DeferredStatus.PENDING, undefined as any)
        return complete
    }
    public subscribe<T,K,R>(address: string, subscriber: Subscriber<T,K,R>, options?: SubscribeOptions): this {
        const subscribers: Subscriber[] = this._subscribers[address] = this._subscribers[address] || []
        if(~subscribers.indexOf(subscriber)) return this

        subscribers.push(Object.assign(subscriber, {
            priority: 0,
            filter: AsyncMediator.filter[subscriber.length]
        }, options))
        subscribers.sort(AsyncMediator.comparePriority)
        return this
    }
    public unsubscribe<T,K,R>(address: string, subscriber?: Subscriber<T,K,R>): this {
        const subscribers: Subscriber[] = this._subscribers[address]
        if(!subscribers) return this

        if(!subscriber) subscribers.length = 0
        else{
            const index = subscribers.indexOf(subscriber)
            if(~index) subscribers.splice(index, 1)
        }
        return this
    }
}