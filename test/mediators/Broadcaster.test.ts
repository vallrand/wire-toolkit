import { Broadcaster } from '../../lib'

it('calls handlers registered at specified address', function(){
    const eventbus = new Broadcaster()

    const handlerA = jest.fn()
    const handlerB = jest.fn()
    const handlerC = jest.fn()

    eventbus.addEventListener('event', handlerA)
    eventbus.addEventListener('event', handlerB)
    eventbus.addEventListener('not event', handlerC)

    eventbus.dispatchEvent('event', 'message')

    expect(handlerA).toHaveBeenCalledWith('message')
    expect(handlerB).toHaveBeenCalledWith('message')
    expect(handlerC).not.toHaveBeenCalled()
})

it('allows to remove listeners', function(){
    const eventbus = new Broadcaster()

    const handlerA = jest.fn()
    const handlerB = jest.fn()

    eventbus.addEventListener('event', handlerA, { single: true })
    eventbus.addEventListener('event', handlerB, { single: false })

    eventbus.dispatchEvent('event', 'message 1')
    eventbus.removeEventListener('event', handlerB)
    eventbus.dispatchEvent('event', 'message 2')

    expect(handlerA).toHaveBeenCalledWith('message 1')
    expect(handlerB).toHaveBeenCalledWith('message 1')
    expect(handlerA).toHaveBeenCalledTimes(1)
    expect(handlerB).toHaveBeenCalledTimes(1)
})

it('Allows to dispatch events while dispatching events', function(){
    const eventbus = new Broadcaster()

    const handlerA = jest.fn()
    const handlerB = jest.fn().mockImplementationOnce(function(){
        eventbus.dispatchEvent('event', 'message 2')
    })

    eventbus.addEventListener('event', handlerA)
    eventbus.addEventListener('event', handlerB)

    eventbus.dispatchEvent('event', 'message 1')

    expect(handlerA).toHaveBeenNthCalledWith(1, 'message 2')
    expect(handlerA).toHaveBeenNthCalledWith(2, 'message 1')

    expect(handlerB).toHaveBeenNthCalledWith(1, 'message 1')
    expect(handlerB).toHaveBeenNthCalledWith(2, 'message 2')
})