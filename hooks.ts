import { useState } from 'react'


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
