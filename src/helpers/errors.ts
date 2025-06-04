import { isObjectEmpty } from '@/lib/utils';
import { IErrorResponse } from '@/types';
import { AxiosError } from 'axios'

export const axiosErrorMessageExtractor = (
    error: AxiosError<{ message?: string; error?: string }>
): string => {
    if (!error.response) {
        if (!error.response) {
            if (
                error.code === 'ECONNREFUSED' ||
                error.message.includes('Network Error')
            ) {
                return 'Network error. Connection refused. Please check if the server is running and accessible.'
            }
            if (error.message.includes('ERR_EMPTY_RESPONSE')) {
                return 'The server did not send any data. Please check the server status.'
            }
            return 'Network error. Please check your connection.'
        }
    }
    const { response } = error

    // Former isObjectEmpty(response)
    if (isObjectEmpty(response.data)) return 'Unknown server error occured'
    switch (response.status) {
        case 404:
            return 'Sorry, the requested resource is not found'
        case 500:
            return 'Sorry, the server encountered an error'
        default:
            return (
                response.data?.message ||
                response.data?.error ||
                'An error occurred. Please try again'
            )
    }
}

export const axiosErrExtractor: TErrorMessageExtractor = [
    AxiosError<IErrorResponse>,
    (err: Error) =>
        axiosErrorMessageExtractor(err as AxiosError<IErrorResponse>),
]



export type TErrorMessageExtractor = [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]) => Error,
    (error: Error) => string,
]

type TErrorMessageExtractors = Array<TErrorMessageExtractor>
type TExtractErrorMessageParams = {
    error: unknown
    errorMessageExtractors?: TErrorMessageExtractors
    showUnknownErrorMessage?: boolean
}


export const extractErrorMessage = ({
    error,
    errorMessageExtractors,
    showUnknownErrorMessage = false,
}: TExtractErrorMessageParams) => {
    if (errorMessageExtractors) {
        for (const [ErrorType, extractor] of errorMessageExtractors) {
            if (error instanceof ErrorType) {
                return extractor(error)
            }
        }
    }
    return showUnknownErrorMessage
        ? ((error as Error)?.message ?? 'An unknown error occured')
        : 'An unknown error occured'
}

/**
 * Since this Server utilize axios, it will throw an AxiosError when an error is encountered,
 * this function returns error message
 * @returns {string}
 */
export const serverRequestErrExtractor = ({
    error,
}: {
    error: unknown
}): string => {
    return extractErrorMessage({
        error,
        errorMessageExtractors: [axiosErrExtractor],
    })
}
