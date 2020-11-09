export function addVisibilityEventListener(callback: (toggle: boolean) => void): boolean {
    const vendorPrefixes = ['','moz','ms','webkit']
    const visibilityProperty = vendorPrefixes
    .map(prefix => `${prefix}${prefix ? 'H' : 'h'}idden`)
    .find(property => property in document)

    if(visibilityProperty == null || !document.addEventListener) return true
    const visibilityEvent = `${visibilityProperty.slice(0, -6)}visibilitychange`

    document.addEventListener(visibilityEvent, event => 
        callback(!(document as any)[visibilityProperty])
    , false)

    return !(document as any)[visibilityProperty]
}