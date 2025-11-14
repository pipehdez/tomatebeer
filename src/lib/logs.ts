export function log(message: string, data?: unknown) {
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
        console.log(message, data)
    }
}
