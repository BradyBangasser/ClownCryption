class UnknownCharError extends Error {
    constructor(string: string, index: number) {
        super(`Unknown character "${string[index]}" in ${string} at index ${index}`)
    }
}

export { UnknownCharError }