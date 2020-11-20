export function ready(callback: Function){
    if(document.readyState !== 'loading') return callback()
    addEventListener('DOMContentLoaded', function DOMContentLoaded(){
        removeEventListener('DOMContentLoaded', DOMContentLoaded)
        callback()
    })
}