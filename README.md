# Wire Toolkit

> **WARNING**: This project is under development. Current use is not recommended!

Collection of messaging systems and mediators.

## Table of Contents

- [Installation](#installation)
- [API](#api)
  - [Broadcaster](#broadcaster)
  - [Channel](#channel)
  - [AsyncMediator](#asyncmediator)
  - [DynamicFactory](#dynamicfactory)

## Installation

With [NPM](https://www.npmjs.com/)
```sh
$ npm install --save @wault/wire-toolkit
```

## API

### Broadcaster
Default synchronous message bus. All listeners are passive and are called immidiately upon dispatch.
```javascript
import { Broadcaster } from '@wault/wire-toolkit'

const eventbus = new Broadcaster()

.addEventListener('test', function handle(message){

}, { single: false })
.removeEventListener('test', handle)

eventbus.dispatchEvent('message')
```

### Channel
Lightweight synchronous single channel emitter.
```javascript
import { Channel } from '@wault/wire-toolkit'

const emitter = new Channel()
.addListener(function handle(value){

}, { single: false })
.removeListener(handle)

emitter.dispatch('message')
emitter.value //"message"
```

### AsyncMediator
```javascript
import { AsyncMediator } from '@wault/wire-toolkit'

const eventbus = new AsyncMediator()
.subscribe('test.event', async function handler(request, response, error){
    const response = await fetch('/api')
    const text = await response.text()
    return text
}, {
    single: false,
    priority: 0,
    filter: 0x01 | 0x02 | 0x04
})
.unsubscribe('test.event', handler)

eventbus.dispatch('test.event', 'message')
.then(response => {

})
```
### DynamicFactory
Dynamic class registration and inheritance/delegation resolution.
```javascript
import { DynamicFactory } from '@wault/wire-toolkit'

const factory = new DynamicFactory()
factory.register('example', Entity => class Example extends Entity {
    print(){ return this.text }
})
factory.register('example', Entity => class OverrideExample extends Entity {
    print(){ return `override ${this.text}` }
})
factory.register('custom-example', () => class InheritanceExample extends factory.resolve('example') {
    print(){ return `extended ${super.print()}` }
})

const example = factory.create({
    class: 'custom-example'
    text: 'content'
})
example.delete()
```