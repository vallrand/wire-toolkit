export function encodeURLQuery(query: {[key: string]: string | null}): string {
    const out: string[] = []
    for(let key in query) if(query[key] != null)
    out.push(`${key}=${encodeURIComponent(query[key] as string)}`)
    return out.join('&')
}

export function decodeURLQuery(url?: string): {[key: string]: string} {
    const link = url ? Object.assign(document.createElement('a'), { href: url }) : location
    const out = Object.create(null)
    const query = link.search.substring(1)
    const regex = /[?&]?([^=]+)=([^&]*)/g
    for(let tokens; tokens = regex.exec(query); out[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]));
    return out
}