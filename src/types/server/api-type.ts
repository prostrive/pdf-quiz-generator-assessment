export interface IOperationCallbacks<
    TDataSuccess = unknown,
    TRawError = unknown,
> {
    onSuccess?: (data: TDataSuccess) => void
    onError?: (error: string, rawError?: TRawError) => void
}

export interface IQueryProps<T = unknown> {
    enabled?: boolean
    initialData?: T
    showMessage?: boolean
    retry?: number
    refetchOnWindowFocus?: boolean
}

export interface IMutationProps {
    showMessage?: boolean
}

export type IAPIHook<TData = unknown, TError = unknown> = IOperationCallbacks<TData, TError>