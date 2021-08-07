# react-object-model

<p align='center'>
    <img src='./rom.png' alt='react-object-model' width='64'>
</p>

<h2 align='center'>
    react-object-model
</h2>

<p align='center'>
    <a href='https://www.npmjs.com/package/react-object-model' target='_blank'>
        <img alt='npm version' src='https://img.shields.io/npm/v/react-object-model.svg?style=flat-square&color=brightgreen' />
    </a>
    <a href='https://www.npmjs.com/package/react-object-model' target='_blank'>
        <img alt='npm downloads' src='https://img.shields.io/npm/dt/react-object-model?style=flat-square&color=brightgreen' />
    </a>
</p>


Object-oriented state management for react

- Lightweight, based merely on React hooks: `useState` and `useEffect`
- Simple and intuitive API: `const { name, age } = user.use(['name', 'age'])`
- Subscription based, diff subscribed properties, no unnecessary rerender of components


## GitHub
[https://github.com/ShenHongFei/react-object-model](https://github.com/ShenHongFei/react-object-model)


## 1. Model
### Usage
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

[![Edit vigilant-northcutt-8p0q4](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/vigilant-northcutt-8p0q4?fontsize=14&hidenavigation=1&theme=light)


### Implementation
```ts
import { useEffect, useRef, useState } from 'react'

export class Model <T> {
    /** Map<rerender, selector> */
    protected _selectors: Map<() => void, (keyof T)[] | undefined>
    
    /** last state */
    protected _state: any
    
    constructor () {
        Object.defineProperty(this, '_selectors', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: new Map<() => void, (keyof T)[] | undefined>()
        })
        
        Object.defineProperty(this, '_state', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: { }
        })
    }
    
    use (selector?: (keyof T)[]) {
        // React guarantees that setState function identity is stable and won’t change on re-renders
        const [, rerender] = useReducer(s => s + 1, 0)
        this._selectors.set(rerender, selector)
        useEffect(() => {
            return () => { this._selectors.delete(rerender) }
        }, [ ])
        return this as any as T
    }
    
    set (data: Partial<T>) {
        Object.assign(this, data)
        this.render()
    }
    
    render () {
        this._selectors.forEach((selector, rerender) => {
            if (selector && !selector.find( key => this[key as any] !== this._state[key] )) return
            rerender({ })
        })
        this._state = { ...this }
    }
}

export default Model
```

<hr/>

## 2. FormModel
### Usage
```tsx
import React from 'react'
import ReactDOM from 'react-dom'

import { FormModel, FormField } from 'react-object-model'


class UserForm extends FormModel <UserFormValues> {
    name = new FormField(this.form, 'name', '')
    
    age = new FormField(this.form, 'age', '0')
    
    override async submit (values: UserFormValues) {
        await delay(3000)
        console.log('submit', values)
    }
    
    override validate ({ name, age }: UserFormValues) {
        return {
            name: name ? undefined : 'name cannot be empty',
            age: Number(age) < 18 ? 'age is less than 18' : undefined,
        }
    }
}

interface UserFormValues {
    name: string
    age: string
}

let fuser = new UserForm()

// re-render only when form state (hasValidationErrors, submitting) change
function UserFormExample () {
    const { form: { hasValidationErrors, submitting, submit } } = fuser.use({ hasValidationErrors: true, submitting: true })
    
    return <>
        <Form className='form-test'>
            <NameInput />
            <AgeInput />
        </Form>
        <Form.Action>
            <Button type='primary' loading={submitting} onClick={submit}>提交 ({String(hasValidationErrors)})</Button>
        </Form.Action>
        <Counter />
    </>
}


// re-render only when name change
function NameInput () {
    const { name } = fuser
    name.use()
    
    return <Form.Item /* auto inject status and message */ {...name.item} /* label='custom label' */>
        <Input {...name.input} autoComplete='off' />
        <Form.Text>touched: {String(name.meta.touched)}, error: {name.meta.error}</Form.Text>
        <Counter />
    </Form.Item>
}

// re-render only when age change
function AgeInput () {
    const { age } = fuser
    age.use()
    
    return <Form.Item {...age.item}>
        <Input {...age.input} autoComplete='off' />
        <Form.Text>touched: {String(age.meta.touched)}, error: {age.meta.error}</Form.Text>
        <Counter />
    </Form.Item>
}

/** counter for rendered times */
function Counter () {
    const rcounter = useRef(0)
    return <div className='counter'>{++rcounter.current}</div>
}

ReactDOM.render(<UserFormExample/>, document.querySelector('.root'))
```
