import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isObjectEmpty = <T extends Record<string, unknown>>(
    obj: T
): boolean => {
    return Object.keys(obj).length === 0
}

export const withCatchAsync = async <
  T,
  E extends new (message?: string) => Error,
>(
  promise: Promise<T>,
  knownErrors?: E[]
): Promise<[undefined, T] | [InstanceType<E>]> => {
  return promise
    .then((data) => [undefined, data] as [undefined, T])
    .catch((err) => {
      if (!knownErrors) return [err]
      if (knownErrors.some((e) => err instanceof e)) return [err]
      throw err
    })
}