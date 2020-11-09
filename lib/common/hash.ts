export function hash(string: string): number {
    let hash: number = 0
    for(let length = string.length, i = 0; i < length; i++)
        hash = ((hash << 5) - hash + string.charCodeAt(i)) | 0
    return hash
}