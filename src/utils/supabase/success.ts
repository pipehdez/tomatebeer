import type { SuccessResponse } from '@/types/request'

export function getSuccessResponse<T>(data: T): SuccessResponse<T> {
    return {
        success: 200,
        message: 'Success',
        error: null,
        data,
    }
}

export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: 200,
    message: 'Success',
    error: null,
    data,
  }
}

export function updateSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: 204,
    message: 'Success',
    error: null,
    data,
  }
}

export function deleteSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: 204,
    message: 'Success',
    error: null,
    data,
  }
}
