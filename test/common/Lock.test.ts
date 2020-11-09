import { Lock } from '../../lib/common/Lock'

it('locks the execution to a single owner', function(){
    const aquireLock = Lock()

    let lockA = jest.fn(),
        lockB = jest.fn(),
        lockC = jest.fn()
    
    aquireLock(lockA)
    aquireLock(lockB)
    
    expect(lockA).toHaveBeenCalled()
    expect(lockB).not.toHaveBeenCalled()
    
    const [ releaseLockA ] = lockA.mock.calls[0]
    releaseLockA()
    
    aquireLock(lockC)
    
    expect(lockB).toHaveBeenCalled()
    expect(lockC).not.toHaveBeenCalled()
    
    const [ releaseLockB ] = lockB.mock.calls[0]
    releaseLockB()
    
    expect(lockC).toHaveBeenCalled()
})