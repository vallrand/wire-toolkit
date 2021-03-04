import { AsyncMediator } from '../../lib'

it('dispatches messages to all handlers', async function(){
    const eventbus = new AsyncMediator()
    const handlers = [
        jest.fn(),
        jest.fn(),
        jest.fn()
    ]
    
    handlers.forEach(handler => eventbus.subscribe('event', handler))
    
    const message = {
        description: 'broadcasted message'
    }
    
    await eventbus.dispatch('event', message)
    
    handlers.forEach(handler => expect(handler).toHaveBeenCalledWith(message))
})

it('receives reply from handler', async function(){
    const eventbus = new AsyncMediator()
    const handler = jest.fn()
    
    eventbus.subscribe('event', handler)
    
    const reply = {
        description: 'handler reply'
    }
    
    handler.mockReturnValue(reply)
    
    await expect(eventbus.dispatch('event', 'request')).resolves.toEqual(reply)
    expect(handler).toHaveBeenCalledWith('request')
})

it('can call handlers only single time', async function(){
    const eventbus = new AsyncMediator()
    const handler = jest.fn()
    
    eventbus.subscribe('event', handler, { single: true })
    
    await Promise.all([
        eventbus.dispatch('event', 'request'),
        eventbus.dispatch('event', 'request'),
        eventbus.dispatch('event', 'request')
    ])
    
    expect(handler).toHaveBeenCalledTimes(1)
})

it('calls handlers in the order of their priority', async function(){
    const eventbus = new AsyncMediator()
    const callOrder: string[] = []
    
    const firstHandler = jest.fn(function(request){
        callOrder.push('first')
    })
    const secondHandler = jest.fn(function(request){
        callOrder.push('second')
    })
    const thirdHandler = jest.fn(function(request){
        callOrder.push('third')
    })
    
    eventbus.subscribe('event', thirdHandler, { priority: 4.5 })
    eventbus.subscribe('event', firstHandler, { priority: -1 })
    eventbus.subscribe('event', secondHandler, { priority: 4 })
    
    await eventbus.dispatch('event', 'request')
    
    expect(callOrder).toEqual(['first','second','third'])
})

it('allows to unsubscribe handlers in the middle of dispatching', async function(){
    const eventbus = new AsyncMediator()
    
    const secondHandler = jest.fn()
    const firstHandler = jest.fn().mockImplementation(() => eventbus.unsubscribe('event', secondHandler))
    
    eventbus.subscribe('event', firstHandler)
    eventbus.subscribe('event', secondHandler)
    
    await eventbus.dispatch('event', 'request')
    
    expect(firstHandler).toHaveBeenCalled()
    expect(secondHandler).not.toHaveBeenCalled()
})

it('allows to override reply context in subsequent handlers', async function(){
    const eventbus = new AsyncMediator()
    
    const firstHandler = jest.fn().mockReturnValue('reply')
    const secondHandler = jest.fn(function(request, response){
        
    }).mockReturnValue('overriden reply' as any)
    const thirdHandler = jest.fn(function(request, response){
        
    })
    
    eventbus.subscribe('event', firstHandler)
    eventbus.subscribe('event', secondHandler)
    eventbus.subscribe('event', thirdHandler)
    
    await expect(eventbus.dispatch('event', 'request')).resolves.toEqual('overriden reply')
    
    expect(firstHandler).toHaveBeenCalledWith('request')
    expect(secondHandler).toHaveBeenCalledWith('request', 'reply')
    expect(thirdHandler).toHaveBeenCalledWith('request', 'overriden reply')
})

it('fails fast and propagates the error to dispatcher', async function(){
    const eventbus = new AsyncMediator()
    
    const firstHandler = jest.fn(function(){
        throw new Error('error')
    })
    const secondHandler = jest.fn(function(request, response){
        
    })
    
    eventbus.subscribe('event', firstHandler)
    eventbus.subscribe('event', secondHandler)
    
    await expect(Promise.resolve(eventbus.dispatch('event', 'request'))).rejects.toThrow('error')
    
    expect(secondHandler).not.toHaveBeenCalled()
})

it('does not add the same handler twice', async function(){
    const eventbus = new AsyncMediator()
    const handler = jest.fn()
    
    eventbus.subscribe('event', handler)
    eventbus.subscribe('event', handler)
    
    await eventbus.dispatch('event', 'request')
    
    expect(handler).toHaveBeenCalledTimes(1)
})

it('allows to use error handlers', async function(){
    const eventbus = new AsyncMediator()
    const firstHandler = jest.fn(function(){
        throw new Error('error')
    })
    const errorHandler = jest.fn(function(request, response, error){
        return 'OK'
    })
    
    eventbus.subscribe('event', firstHandler)
    eventbus.subscribe('event', errorHandler)
    
    await expect(eventbus.dispatch('event', 'request')).resolves.toEqual('OK')
    
    expect(errorHandler).toHaveBeenCalledWith('request', undefined, expect.any(Error))
})

it('allows overriding handlers', async function(){
    const eventbus = new AsyncMediator()
    const handler = jest.fn().mockReturnValue('initial')
    const overrideHandler = jest.fn().mockReturnValue('override')
    const postProcessA = jest.fn()
    const postProcessB = jest.fn()
    eventbus.subscribe('event', handler, { priority: 0, filter: 1 })
    eventbus.subscribe('event', postProcessA, { priority: 1, filter: 2 })
    eventbus.subscribe('event', postProcessB, { priority: 1, filter: 2 })
    eventbus.subscribe('event', overrideHandler, { priority: -1, filter: 1 })

    await expect(eventbus.dispatch('event', 'request')).resolves.toEqual('override')
    expect(handler).not.toHaveBeenCalled()
    expect(overrideHandler).toHaveBeenCalledTimes(1)
    expect(postProcessA).toHaveBeenCalledWith('request', 'override')
    expect(postProcessB).toHaveBeenCalledWith('request', 'override')
})