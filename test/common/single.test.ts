import { single } from '../../lib/common/single'

it('executes function only single time', function(){
    const callback = jest.fn().mockReturnValue('output')
    const callbackOnce = single(callback)
    
    expect(callbackOnce('input 1')).toEqual('output')
    expect(callbackOnce('input 2')).toEqual('output')
    
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenNthCalledWith(1, 'input 1')
})