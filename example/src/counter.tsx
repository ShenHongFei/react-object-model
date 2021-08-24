import './counter.sass'

import { default as React, useRef } from 'react'

export function Counter () {
    const rcounter = useRef(0)
    return <div className='counter'>{++rcounter.current}</div>
}

export default Counter
