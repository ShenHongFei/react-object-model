import { useEffect, useState } from 'react'


/** 面向对象的 react 状态管理  Object-oriented state management for react.  
    @see https://github.com/ShenHongFei/react-object-model
    @example ```ts
    class User extends Model <User> {
        name = 'Tom'
        age = 16
    }
    
    let user = new User()
    ``` */
export class Model <TModel> {
    /** Map<rerender, selector> */
    protected _selectors: Map<({ }) => void, (keyof TModel)[]>
    
    /** 保存上次渲染的状态用于比较  last state */
    protected _state: any
    
    
    constructor () {
        Object.defineProperty(this, '_selectors', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: new Map()
        })
        
        Object.defineProperty(this, '_state', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: { }
        })
    }
    
    
    /** 像使用 react hooks 那样订阅模型属性  use and watch model's properties like react hooks  
        use 之后，通过 set 更新属性才会触发组件重新渲染  After `use`, properties updated by `set` will trigger rerender
        @param selector 订阅属性名称组成的数组  selector array of properties to watch
        @returns 模型本身  model self
        @example ```ts
            const { name, age } = user.use(['name', 'age'])
            ``` */
    use <Key extends keyof TModel> (selector?: Key[]) {
        // React guarantees that dispatch function identity is stable and won’t change on re-renders
        const [, rerender] = useState({ })
        
        // 需要在 render 阶段就将组件加到订阅中，因为 effects 之间的执行顺序很难规划，react 只保证 render 过程在 effect 之前
        // 一般情况下子组件 effect 先执行，如果此时子组件 effect 中改变了父组件通过 use 订阅的状态，
        // 而订阅关系又不在 render 阶段设置，那么通过 use 订阅的状态的父组件还未执行下面的 effect 建立订阅关系，会漏掉这次更新
        this._selectors.set(rerender, selector)
        
        useEffect(() => {
            // 需要在 useEffect 里再次将组件加到订阅中，因为
            // strict mode 的 Ensuring reusable state 在 remount 组件时只会重新执行所有 effect, 不会再执行 render
            this._selectors.set(rerender, selector)
            return () => { this._selectors.delete(rerender) }
        }, [ ])
        
        return this as any as Pick<TModel, Key>
    }
    
    
    /** 更新模型属性，diff, 重新渲染对应组件  assign properties to model then diff then rerender (when changed)
        @param data 属性  data properties
        @example ```ts
            user.set({ name: 'Tom', age: 16 })
            ``` */
    set (data: Partial<TModel>) {
        Object.assign(this, data)
        this.render()
    }
    
    
    render (diffs?: (keyof TModel)[]) {
        const set_diffs = diffs ? new Set(diffs) : null
        
        for (const [rerender, selector] of this._selectors)
            if (
                !selector || 
                selector.find(key => 
                    set_diffs ?
                        set_diffs.has(key)
                    :
                        this[key as any] !== this._state[key]
                )
            )
                rerender({ })
        
        this._state = { ...this }
    }
}

