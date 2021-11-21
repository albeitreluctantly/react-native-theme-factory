import { AnyObject, AnyStyleSheet, ProcessedThemeConfig, ThemesConfig, ThemesList } from '../types'
import { isObject, Reactive, useForceUpdate, useReactiveListener } from './common'
import React, { ComponentType } from 'react'

export const createUseTheme =
  <T extends ThemesList, C extends ProcessedThemeConfig<T, ThemesConfig>>(
    theme: Reactive<T[keyof T]>,
    themeConfig: C
  ) =>
  () => {
    const forceUpdate = useForceUpdate()
    useReactiveListener(theme, forceUpdate)

    return themeConfig
  }

export const createWithTheme =
  (useTheme: () => any) =>
  <T,>(Component: ComponentType<T>) =>
  (props: T) => {
    const theme = useTheme()

    return <Component {...props} theme={theme} />
  }

export const createStyleSheetFabric =
  <TList extends ThemesList, TConfig extends ThemesConfig>(
    currentTheme: Reactive<TList[keyof TList]>,
    currentThemeConfig: { value: ProcessedThemeConfig<TList, TConfig> }
  ) =>
  <S extends AnyStyleSheet>(styles: (theme: ProcessedThemeConfig<TList, TConfig>) => S): S => {
    const result: any = {}

    let stylesheet = styles(currentThemeConfig.value)
    let prevTheme = currentTheme.value
    let isRendered = false

    /**
   Important! Theme change optimization
   When theme changes those components, which hadn't been rendered, wouldn't generate
   their styles anew during render after theme's change
   */
    const dispose = currentTheme.listen(theme => {
      if (isRendered) {
        dispose()
      } else {
        prevTheme = theme
      }
    })

    Object.keys(stylesheet).forEach(key =>
      Object.defineProperty(result, key, {
        enumerable: true,
        configurable: true,
        get: () => {
          isRendered = true
          if (currentTheme.value !== prevTheme) {
            /** Important! To generate styles only the first time they are accessed after changing the theme */
            prevTheme = currentTheme.value
            stylesheet = styles(currentThemeConfig.value)
          }
          return stylesheet[key]
        }
      })
    )

    return result
  }

export const parseThemeConfig = <TKeys extends ReadonlyArray<string | number>, D extends ThemesConfig>(
  config: D,
  currentTheme: string | number,
  themeKeys: TKeys
): ProcessedThemeConfig<any, D> =>
  Object.fromEntries(
    Object.entries(config).map(([key, value]) => {
      if (!isObject(value)) {
        return [key, value]
      }
      const anyThemeValue = getThemeValue(value, themeKeys, currentTheme)
      if (anyThemeValue !== undefined) return [key, anyThemeValue]

      return [key, parseThemeConfig(value as any, currentTheme, themeKeys)]
    })
  ) as any

const getThemeValue = (
  obj: AnyObject,
  themeKeys: ReadonlyArray<string | number>,
  currentTheme: string | number
): any => {
  const objKeys = Object.keys(obj)
  if (objKeys.length > themeKeys.length) return undefined

  const value = obj[currentTheme] || obj[objKeys.find(key => themeKeys.includes(key)) as any]

  if (value === undefined) return undefined

  if (objKeys.every(key => themeKeys.includes(key))) return value

  return undefined
}
