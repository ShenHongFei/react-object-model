import {
    useCallback, useEffect, useRef, useState, 
    type Dispatch, type RefObject, type SetStateAction
} from 'react'


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
    RefObject<TState>,
    Dispatch<SetStateAction<TState>>
] {
    let [state, _set_state] = useState(initial_state)
    let ref = useRef(state)
    return [state, ref, (value: TState) => { _set_state(ref.current = value) }]
}


/** 根据 html element 渲染的高度更新 height state */
export function use_height <TElement extends HTMLElement = HTMLElement> (initial_height: number): [
    number, RefObject<TElement>
] {
    let [height, set_height] = useState(initial_height)
    let ref = useRef<TElement>(undefined)
    
    useEffect(() => {
        if (ref.current)
            set_height(ref.current.clientHeight)
    }, [ref.current])
    
    return [height, ref]
}


export function use_keydown (
    on_keydown: (event: KeyboardEvent) => void,
    target: EventTarget = window
) {
    useEffect(() => {
        target.addEventListener('keydown', on_keydown)
        return () => { target.removeEventListener('keydown', on_keydown) }
    }, [ ])
}


export function use_before_unload (
    on_before_unload: (event: BeforeUnloadEvent) => void
) {
    useEffect(() => {
        window.addEventListener('beforeunload', on_before_unload)
        return () => { window.removeEventListener('beforeunload', on_before_unload) }
    }, [ ])
}


export interface Size {
    width: number
    height: number
}

export function use_size <TElement extends HTMLElement = HTMLDivElement> (
    ref: RefObject<TElement>
): Size | undefined {
    let [size, set_size] = useState<Size | undefined>(undefined)
    
    const on_resize = useCallback((entries: ResizeObserverEntry[]) => {
        const { width, height } = entries[0].contentRect
        set_size({ width, height })
    }, [ ])
    
    useEffect(() => {
        let observer = new ResizeObserver(on_resize)
        
        observer.observe(ref.current)
        
        return () => {
            observer.disconnect()
        }
    }, [ref, on_resize])
    
    return size
}
