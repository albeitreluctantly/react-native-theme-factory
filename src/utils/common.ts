import { DependencyList, useCallback, useEffect, useState } from 'react'
import { AnyObject } from '../types'

export const isObject = (a: any): a is { [key: string]: any } => !!a && a.constructor === Object

export const useForceUpdate = () => {
  const [, setTick] = useState(0)

  return useCallback(() => {
    setTick(tick => tick + 1)
  }, EMPTY_ARRAY)
}

export const deepMutate = (oldT: AnyObject, newT: AnyObject) => {
  Object.keys(newT).forEach(key => {
    const value = newT[key]
    if (isObject(value)) {
      deepMutate((oldT as any)[key], value)
    } else {
      ;(oldT as any)[key] = newT[key]
    }
  })
}

// The simplest observable, created just "ad hoc"
export class Reactive<T> {
  private _listeners = new Set<ReactiveListener<T>>()
  private _value: T

  constructor(value: T) {
    this._value = value
  }

  public get value() {
    return this._value
  }

  public set value(value: T) {
    if (this._value === value) return
    this._value = value

    this._listeners.forEach(listener => listener(this.value))
  }

  public listen(listener: ReactiveListener<T>): () => void {
    this._listeners.add(listener)

    return () => this._listeners.delete(listener)
  }
}

export const reactive = <T>(value: T) => new Reactive(value)

export const useReactiveListener = <T>(
  value: Reactive<T>,
  listener: ReactiveListener<T>,
  deps: DependencyList = EMPTY_ARRAY
) => useEffect(() => value.listen(listener), deps)

type ReactiveListener<T> = (value: T) => void

const EMPTY_ARRAY: any[] = []
