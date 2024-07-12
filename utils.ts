import type { ReactNode, ReactElement } from 'react'


export function join_elements (elements: ReactNode[], seperator: ReactElement) {
    const nelements = elements.length
    let results = new Array(nelements * 2 - 1)
    
    for (let i = 0;  i < nelements;  i++) {
        results[i * 2] = elements[i]
        if (i < nelements - 1) {
            const key = i * 2 + 1
            results[key] = { ...seperator, key }
        }
    }
    
    return results
}
