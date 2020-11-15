interface IEntity {
    class: string
    attributes(values: Record<string, any>): this
    delete(): void
}

type Constructor<T> = new () => T
type ConstructorFactory<T,P=any> = (prev: Constructor<P>) => Constructor<T>

export class DynamicFactory {
    private readonly _registry: Record<string, {
        root: Constructor<any>,
        queue: ConstructorFactory<any>[]
    }> = Object.create(null)
    private readonly _pool: Record<string, any[]> = Object.create(null)
    private readonly _entity: Constructor<IEntity>
    constructor(){
        const delegate: DynamicFactory = this
        this._entity = class Entity implements IEntity {
            class: string = ''
            attributes(values: Record<string, any>): this {
                for(let key in values) (this as any)[key] = values[key]
                return this
            }
            delete(){delegate.recycle(this)}
        }
    }
    public resolve<T>(className: string): Constructor<T> {
        const registry = this._registry[className]
        if(!registry) throw new Error(`Class "${className}" not registered.`)
        const root: Constructor<T> = registry.queue
        .reduce((prev: Constructor<any>, factory: ConstructorFactory<T>) => factory(prev), registry.root)
        registry.queue.length = 0
        return registry.root = root
    }
    public register<T>(className: string, factory: ConstructorFactory<T>): this {
        if(!this._registry[className])
            this._registry[className] = { root: this._entity, queue: [] }
        this._registry[className].queue.push(factory)
        return this        
    }
    public create<T extends IEntity>(attributes: { class: string, [attribute: string]: any }): T {
        const className = attributes.class
        const Constructor = this.resolve<T>(className)
        const instance = this._pool[className] && this._pool[className].pop() as T || new Constructor()
        instance.attributes(attributes)
        return instance
    }
    public recycle<T extends { class: string }>(instance: T): this {
        const className = instance.class
        this._pool[className] = this._pool[className] || []
        if(!~this._pool[className].indexOf(instance))
        this._pool[className].push(instance)
        return this
    }
    protected _query(className: string): string[] {
        const out: string[] = []
        const SuperClass = this.resolve(className)
        for(let className in this._registry)
            if(Object.isPrototypeOf.call(SuperClass, this.resolve(className)))
                out.push(className)
        return out
    }
}