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
