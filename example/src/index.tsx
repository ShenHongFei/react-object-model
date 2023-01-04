/* eslint-disable */
import './index.sass'

import React from 'react'
import { createRoot } from 'react-dom/client'

import { Model } from 'react-object-model'

import RenderCounter from './counter'

function Example () {
    const { name } = user.use(['name'])
    
    const { value } = counter.use(['value'])
    
    
    return <div className='example'>
        <div className='user'>
            <h3>User:</h3>
            <div>
                <button onClick={() => {
                    // set model properties by `model.set` method
                    // (`user.name = 'Tom'` is not allowed)
                    user.set({ name: 'Tom', age: 16 })
                }}>login</button>
                
                <button onClick={() => {
                    // will not trigger rerender as we don't use (subscribe to) user's age in this component
                    // (except for the first `user.set` call as the model doesn't know the previous state)
                    user.set({ age: Math.trunc(100 * Math.random()) })
                }}>set age</button>
                
                <button onClick={() => {
                    // but we could get current value of model's property without subscription
                    alert(user.age)
                    console.log('user.age = ', user.age)
                }}>get age</button>
                
                <button onClick={async () => {
                    // call model method to change it's state
                    await user.logout()
                    alert('user logged out')
                    console.log('user logged out')
                }}>logout (delay 2s)</button>
            </div>
            <div className='display'>user.name = {name}</div>
        </div>
        
        <div className='example-counter'>
            <h3>Counter:</h3>
            <div>
                <button onClick={() => { counter.increase() }}>+1</button>
                
                <button onClick={ async () => {
                    await counter.increase_async()
                    console.log('counter.value', counter.value)
                } }>+1 (delay 2s)</button>
                
                <button onClick={() => { counter.reset() }}>reset</button>
            </div>
            <div className='display'>counter.value = {value}</div>
        </div>
        
        <div className='stats'>
            <h3>Statistics:</h3>
            <div className='detail'>
                <div>{'<'}Example{' />'} component rendered</div>
                <RenderCounter />
                <div>times</div>
            </div>
        </div>
    </div>
}


class User extends Model<User> {
    name = ''
    age = 0
    
    async logout () {
        await delay(2000)
        this.set({ name: '', age: 0 })
    }
}

let user = new User()

class Counter extends Model<Counter> {
    value = 0
    
    reset () {
        this.set({ value: 0 })
    }
    
    increase () {
        this.set({ value: this.value + 1 })
    }
    
    async increase_async () {
        await delay(2000)
        this.set({ value: this.value + 1 })
    }
}

let counter = new Counter()

async function delay (milliseconds: number) {
    return new Promise( resolve => {
        setTimeout(resolve, milliseconds)
    })
}


createRoot(
    document.querySelector('.root')
).render(
    <Example />
)
