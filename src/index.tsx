import React, { ReactNode } from 'react'
import { ProcessedThemeConfig, ThemeFactory, ThemeListener, ThemesConfig, ThemesList } from './types'
import { deepMutate, reactive } from './utils/common'
import { createStyleSheetFabric, createUseTheme, createWithTheme, parseThemeConfig } from './utils/theme'

export const createThemeFactory = <TList extends ThemesList, TConfig extends ThemesConfig>(
  themesList: TList,
  themesConfig: TConfig,
  defaultTheme: TList[keyof TList] = Object.keys(themesList)[0] as any
): ThemeFactory<TList, TConfig> => {
  const themeKeys = Object.values(themesList)

  const currentTheme = reactive(defaultTheme)

  let prevTheme = currentTheme.value

  const cachedThemes = new Map<keyof TList, ProcessedThemeConfig<TList, TConfig>>()

  const currentThemeConfig: { value: ProcessedThemeConfig<TList, TConfig> } = {
    value: parseThemeConfig(themesConfig, defaultTheme, themeKeys)
  }

  const getCurrentTheme = () => {
    return currentTheme.value
  }

  const setCurrentTheme = (theme: TList[keyof TList]) => {
    if (theme !== prevTheme) {
      prevTheme = theme
      const cachedTheme = cachedThemes.get(theme)
      const newTheme = cachedTheme || parseThemeConfig(themesConfig, theme, themeKeys)
      if (!cachedTheme) {
        cachedThemes.set(theme, newTheme)
      }
      // Deeply mutates theme config to keep all refs to its nested objects
      deepMutate(currentThemeConfig.value, newTheme)
      currentTheme.value = theme
    }
  }

  const listenToThemeChange: ThemeListener<TList> = listener => currentTheme.listen(listener)

  const useTheme = createUseTheme(currentTheme, currentThemeConfig.value)
  const withTheme = createWithTheme(useTheme)

  const createThemedStyleSheet = createStyleSheetFabric(currentTheme, currentThemeConfig)

  const ThemeRenderer = ({ children }: any) => {
    useTheme()
    return children(currentThemeConfig.value as any)
  }

  const th = (render: (theme: ProcessedThemeConfig<TList, TConfig>) => ReactNode) => {
    return <ThemeRenderer children={render} />
  }

  return {
    config: currentThemeConfig.value,
    getCurrentTheme,
    setCurrentTheme,
    listenToThemeChange,
    useTheme,
    withTheme,
    createThemedStyleSheet,
    th
  }
}
