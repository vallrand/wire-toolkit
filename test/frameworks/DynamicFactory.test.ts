import { DynamicFactory } from '../../lib'

it('allows to register a class factory chain', function(){
    const factory = new DynamicFactory()
    const order: number[] = []

    factory.register('test', BaseClass => class A extends BaseClass {
        constructor(){
            super()
            order.push(1)
        }
        get name(){ return 'name is' }
    })
    factory.register('test', BaseClass => class B extends BaseClass {
        constructor(){
            super()
            order.push(2)
        }
    })
    factory.register('test', BaseClass => class C extends BaseClass {
        constructor(){
            super()
            order.push(3)
        }
        get name(){ return super.name + ' unknown' }
    })

    const test = factory.create<any>({
        class: 'test',
        propertyA: 'example a',
        propertyB: 234
    })

    expect(order).toEqual([1,2,3])
    expect(test.name).toEqual('name is unknown')
    expect(test).toEqual({
        class: 'test',
        propertyA: 'example a',
        propertyB: 234
    })
})

it('resolves inheritance dynamicly', function(){
    const factory = new DynamicFactory()
    factory.register('base-test', BaseClass => class A extends BaseClass {
        test(){ return 'test string' }
    })
    factory.register('test', () => class B extends factory.resolve<any>('base-test') {
        test(){ return super.test() + ' value' }
    })
    factory.register('base-test', BaseClass => class C extends BaseClass {
        test(){ return 'updated ' + super.test() }
    })

    expect(factory.create<any>({ class: 'test' }).test()).toEqual('updated test string value')

    factory.register('test', BaseClass => class D extends BaseClass {
        test(){ return 'override' }
    })

    expect(factory.create<any>({ class: 'test' }).test()).toEqual('override')
})

it('allows to resolve singleton classes', function(){
    const factory = new DynamicFactory()
    factory.register('singleton', () => ({
        paramA: 'a',
        test(){ return 'test' }
    }) as any)
    factory.register('singleton', (Base: any) => Object.setPrototypeOf({
        paramB: 'b',
        test(){ return 'extended ' + Base.test.call(this) }
    }, Base))

    const singleton = factory.resolve('singleton') as any
    expect(singleton.paramA).toEqual('a')
    expect(singleton.paramB).toEqual('b')
    expect(singleton.test()).toEqual('extended test')

    expect(singleton).toBe(factory.resolve('singleton'))
})

it('reuses entities using object pool', function(){
    const factory = new DynamicFactory()
    let counter = 0
    factory.register('reusable', BaseClass => class Reusable extends BaseClass {
        id = counter++
        delete(){
            this.value = null
            super.delete()
        }
    })

    const a = factory.create({ class: 'reusable', value: 'test' })
    expect(a).toEqual({ class: 'reusable', value: 'test', id: 0 })
    a.delete()

    const b = factory.create({ class: 'reusable' })
    expect(b).toEqual({ class: 'reusable', value: null, id: 0 })

    expect(counter).toEqual(1)
})