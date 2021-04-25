import { useEffect, useRef, useState } from 'react'


/** Object-oriented state management for react.  
    @see https://github.com/ShenHongFei/react-object-model
    @example
    ```ts
    class User extends Model <User> {
        name = 'Tom'
        age = 16
    }
    ```
*/
export class Model <T> {
    protected _selectors: Map<React.MutableRefObject<(keyof T)[] | undefined>, ({ }) => void>
    
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
    
    /** use and watch model's properties like react hooks
        @param selector array of properties to watch
        @returns model self
        @example
        ```ts
        const { name, age } = user.use(['name', 'age'])
        ```
    */
    use (selector?: (keyof T)[]) {
        const ref = useRef(selector)
        this._selectors.set(ref, useState({ })[1])
        useEffect(() => {
            return () => { this._selectors.delete(ref) }
        }, [])
        return this as any as T
    }
    
    /** assign properties to model then diff then rerender (when changed)
        @param data properties
        @example
        ```ts
        user.set({ name: 'Tom', age: 16 })
        ```
    */
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
