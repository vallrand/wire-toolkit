# Wire Toolkit

> **WARNING**: This project is under development. Current use is not recommended!

Collection of messaging systems and mediators.

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

}, { once: false })
.removeEventListener('test', handle)

eventbus.dispatchEvent('message')
```

### Channel
Lightweight synchronous single channel emitter.
```javascript
import { Channel } from '@wault/wire-toolkit'

const emitter = new Channel()
.addListener(function handle(value){

}, { once: false })
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