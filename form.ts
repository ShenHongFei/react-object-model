import { type default as React, useEffect, useState } from 'react'

import {
    createForm,
    formSubscriptionItems,
    fieldSubscriptionItems,
    type FormState,
    type FieldState,
    type FormApi,
    type FormSubscription,
    type FieldSubscription,
    type SubmissionErrors,
    type ValidationErrors
} from 'final-form'


import { Model } from './index.ts'


/** 基于 final-form 的面向对象的表单模型  Object-oriented form model based on final-form.  
    用于封装 @tencent/tea-componet      Designed to work seamlessly with Form component of @tencent/tea-componet.  
    @see https://github.com/ShenHongFei/react-object-model
    @example ```ts
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
        
        let fuser = new UserForm()
    ``` */
export class FormModel <FormValues> {
    static subscription_form_all =  Object.fromEntries(
        formSubscriptionItems.map(key => [key, true])
    )
    
    /** final-form 实例和表单状态  final-form instance & form state */
    form: FormApi<FormValues> & FormState <FormValues> = createForm<FormValues>({
        onSubmit: (values, form) => this.submit(values, form),
        validate: values => this.validate(values),
    }) as any
    
    
    /** 在组件中订阅表单状态（不传参则默认订阅所有表单状态修改）  subscribe to form state in a component (defaults to subscribe all changes)
        @example const { form: { hasValidationErrors, submitting, submit } } = fuser.use({ hasValidationErrors: true, submitting: true }) */
    use (subscription: FormSubscription = FormModel.subscription_form_all) {
        const { form } = this
        
        const [state, set_state] = useState(() => form.getState())
        
        Object.assign(form, state)
        
        useEffect(
            () => form.subscribe(set_state, subscription),
            [ ]
        )
        
        return this
    }
    
    
    /** 需要被子类重写，在 final-form 的 submit 被调用时执行  should be overriden by subclass, called when final-form submit is called */
    submit (values: FormValues, form: FormApi<FormValues>): SubmissionErrors | Promise<SubmissionErrors> | void {
        
    }
    
    
    /** 需要被子类重写，用于自定义字段校验错误  should be overriden by subclass for customized fields validation errors */
    validate (values: FormValues): ValidationErrors | Promise<ValidationErrors> {
        return { }
    }
}



export interface FormField <FormValues, Value> extends FieldState <Value> { }

export class FormField <FormValues, Value> extends Model <FormField<FormValues, Value>> {
    static subscription_field_all =  Object.fromEntries(
        fieldSubscriptionItems.map( key => [key, true])
    )
    
    static get_event_value (event) {
        const target = event?.target
        if (!target) 
            return event
        
        if (target.type === 'checkbox') 
            return target.checked
        
        return target.value
    }
    
    
    value: Value
    
    form: FormApi<FormValues>
    
    item: {
        label: string
        status: 'success' | 'error' | 'validating'
        message: React.ReactNode
    } = {
        label: '',
        status: 'validating',
        message: ''
    }
    
    input: {
        name: string
        onBlur <T> (event?: React.FocusEvent<T>): void
        onChange <T> (event: React.ChangeEvent<T> | Value): void
        onFocus <T> (event?: React.FocusEvent<T>): void
        value: Value
        checked?: boolean
    }
    
    meta: NonFunctionProperties<FieldState<Value>>
    
    unsubscribe: () => void
    
    
    constructor (
        form: FormApi<FormValues>, 
        name: keyof FormValues, 
        initial_value: Value, 
        subscription: FieldSubscription = FormField.subscription_field_all
    ) {
        super()
        
        this.item.label = name as string
        this.value = initial_value
        this.form = form
        
        this.unsubscribe = this.form.registerField(
            name,
            state => {
                const { blur, change, focus, value, ...meta } = state
                
                this.set({
                    value: value as any,
                    meta: meta as any,
                    input: {
                        name: this.name,
                        value: value === undefined ? '' : value as any,
                        onBlur () {
                            state.blur()
                        },
                        onChange (event) {
                            state.change(FormField.get_event_value(event))
                        },
                        onFocus () {
                            state.focus()
                        },
                    },
                    item: this.get_field_item(meta, value as any)
                })
            },
            subscription,
            { initialValue: initial_value }
        )
    }
    
    
    get_field_item ({ touched, error }: { touched?: boolean, error?: any }, value: Value): {
        status: 'success' | 'error' | 'validating'
        message: React.ReactNode
        label: string
    } {
        const label = this.item.label
        if (!touched) return { label, status: undefined, message: '' }
        if (error) return { label, status: 'error', message: error }
        return { label, status: 'success', message: '' }
    }
}


type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K
}[keyof T]

type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>
