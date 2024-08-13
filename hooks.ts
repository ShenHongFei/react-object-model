import { useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from 'react'


export function use_rerender () {
    const set_state = useState({ })[1]
    
    return function rerender () {
        set_state({ })
    }
}


export function use_modal (): ModalController {
    const [visible, set_visible] = useState(false)
    
    return {
        visible,
        
        open () {
            set_visible(true)
        },
        
        close () {
            set_visible(false)
        }
    }
}


export interface ModalController {
    visible: boolean
    open(): void
    close(): void
}


/** 类似 useState, 同时将 state 绑定到 ref 从而方便的获取其最新的值, 返回 [state, ref, set_state] */
export function use_ref_state <TState> (initial_state?: TState | (() => TState)): [
    TState,
    MutableRefObject<TState | (() => TState)>,
    Dispatch<SetStateAction<TState>>
] {
    let [state, _set_state] = useState(initial_state)
    let ref = useRef(state)
    return [state, ref, (value: TState) => { _set_state(ref.current = value) }]
}
