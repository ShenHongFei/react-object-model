# react-object-model
Object-oriented state management for react


## Usage
```tsx
import React from 'react'
import ReactDOM from 'react-dom'

import Model from 'react-object-model'

function Example () {
    const { value } = counter.use(['value'])
    
    return <div>
        <div>counter.value = {value}</div>
        <div>
            <button onClick={ () => { counter.increase() } }>+1</button>
            
            <button onClick={ async () => {
                await counter.increase_async()
                console.log('counter.value', counter.value)
            } }>+1 (delay 2s)</button>
            
            <button onClick={ () => { counter.reset() } }>reset</button>
        </div>
    </div>
}


class Counter extends Model <Counter> {
    value = 0
    
    reset () {
        this.set({ value: 0 })
    }
    
    increase () {
        this.set({ value: this.value + 1 })
    }
    
    async increase_async () {
        await new Promise(resolve => { setTimeout(resolve, 2000) })
        this.set({ value: this.value + 1 })
    }
}

let counter = new Counter()

ReactDOM.render(<Example/>, document.querySelector('.root'))
```


## Implementation
```ts
import { useEffect, useRef, useState } from 'react'

export class Model <T> {
    protected _selectors: Map<React.MutableRefObject<(keyof T)[]>, ({ }) => void>
    
    protected _state: any
    
    constructor () {
        Object.defineProperty(this, '_selectors', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: new Map<React.MutableRefObject<(keyof T)[]>, ({ }) => void>()
        })
        
        Object.defineProperty(this, '_state', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: { }
        })
    }
    
    use (selector?: (keyof T)[]) {
        const ref = useRef(selector)
        this._selectors.set(ref, useState({ })[1])
        useEffect(() => {
            return () => { this._selectors.delete(ref) }
        }, [])
        return this as any as T
    }
    
    set (data: Partial<T>) {
        Object.assign(this, data)
        this.render()
    }
    
    render () {
        this._selectors.forEach( (setState, { current: selector }) => {
            if (selector && !selector.find( (key: keyof T) => this[key as any] !== this._state[key] ))
                return
            setState({ })
        })
        this._state = { ...this }
    }
}

export default Model
```
