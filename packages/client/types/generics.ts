import {MutableRefObject} from 'react'

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
export type Subtract<T, K> = Omit<T, keyof K>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
  ? DeepPartial<U>[]
  : T[P] extends readonly (infer U)[]
  ? readonly DeepPartial<U>[]
  : DeepPartial<T[P]>
}
export type DeepNullable<T> = {
  [P in keyof T]: T[P] extends (infer U)[]
  ? DeepNullable<U>[] | null
  : T[P] extends readonly (infer U)[]
  ? readonly DeepNullable<U>[] | null
  : DeepNullable<T[P]> | null
}

export type DeepNonNullable<T> = T extends (...args: any[]) => any
  ? T
  : T extends any[]
  ? DeepNonNullableArray<T[number]>
  : T extends object
  ? DeepNonNullableObject<T>
  : T

interface DeepNonNullableArray<T> extends Array<DeepNonNullable<NonNullable<T>>> { }

type DeepNonNullableObject<T> = {
  [P in keyof T]-?: DeepNonNullable<NonNullable<T[P]>>
}

// export type DeepNullableObject<T> = {
//   [P in keyof T]: T[P] extends Array<infer U>
//     ? Array<DeepNullable<U>> | null
//     : T[P] extends ReadonlyArray<infer U>
//       ? ReadonlyArray<DeepNullable<U>> | null
//       : T[P] extends object
//         ? DeepNullable<T[P]> | null
//         : T[P]
// };
export type Opaque<K, T> = T & {__TYPE__: K}

export type Writeable<T> = {-readonly [P in keyof T]: T[P]}

// there's rumor of a negated operator coming to TS soon...
export type NotVoid =
  | {[key: string]: NotVoid}
  | object
  | string
  | boolean
  | symbol
  | number
  | null
  | undefined

export type ValueOf<T> = T[keyof T]

export type FirstParam<T> = T extends (arg1: infer A, ...args: any[]) => any ? A : never
export type SecondPlusParams<T> = T extends (node: any, ...args: infer A) => void ? A : never
export type UnshiftToTuple<V, T extends any[]> = Parameters<(a: V, ...args: T) => void>
export type Unpromise<T> = T extends Promise<infer U> ? U : T
export type Unref<T> = T extends MutableRefObject<infer U> ? U : T
export type RefCallbackInstance<T extends HTMLElement = HTMLElement> = T | null

type PrependNextNum<A extends Array<unknown>> = A['length'] extends infer T
  ? ((t: T, ...a: A) => void) extends (...x: infer X) => void
  ? X
  : never
  : never

type EnumerateInternal<A extends Array<unknown>, N extends number> = {
  0: A
  1: EnumerateInternal<PrependNextNum<A>, N>
}[N extends A['length'] ? 0 : 1]

export type Enumerate<N extends number> = EnumerateInternal<[], N> extends (infer E)[] ? E : never

export type Range<FROM extends number, TO extends number> = Exclude<Enumerate<TO>, Enumerate<FROM>>
