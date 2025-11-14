export type SuccessResponse<T> = {
    success: number
    message: string
    error: null
    data: T
}

export type ErrorResponse = {
    success: number
    error: string
}

export type RequestResponse<T> = SuccessResponse<T> | ErrorResponse
