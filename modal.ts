import { useState } from 'react'


export function use_modal () {
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
