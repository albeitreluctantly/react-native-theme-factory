import { ComponentType, ReactNode } from 'react'
import { ImageStyle, TextStyle, ViewStyle } from 'react-native'

export type AnyObject = { [key: string]: any }

export type AnyStyle = ViewStyle & TextStyle & ImageStyle

export type AnyStyleSheet = {
  readonly [key: string]: AnyStyle
}

export type ThemesList = {
  readonly [key: string]: string
}

export type ThemesConfig = {
  readonly [key: string]: string | number | ThemesConfig
}

export type ProcessedThemeConfig<TList extends ThemesList, Config extends AnyObject> = {
  readonly [K in keyof Config]: Config[K] extends AnyObject
    ? Config[K][TList[keyof TList]] extends string | number
      ? Config[K][TList[keyof TList]]
      : ProcessedThemeConfig<TList, Config[K]>
    : Config[K]
}

export type ThemeListener<TList extends ThemesList> = (listener: (currentTheme: TList[keyof TList]) => void) => void

export interface ThemedComponentProps<Theme extends ThemesList, Data extends ThemesConfig> {
  readonly theme: ProcessedThemeConfig<Theme, Data>
}

export interface ThemeFactory<TList extends ThemesList, TConfig extends ThemesConfig> {
  readonly config: ProcessedThemeConfig<TList, TConfig>
  readonly setCurrentTheme: (theme: TList[keyof TList]) => void
  readonly getCurrentTheme: () => TList[keyof TList]
  readonly listenToThemeChange: ThemeListener<TList>
  readonly withTheme: <T>(
    Component: ComponentType<T & ThemedComponentProps<TList, TConfig>>
  ) => ComponentType<T & ThemedComponentProps<TList, TConfig>>
  readonly useTheme: () => ProcessedThemeConfig<TList, TConfig>
  readonly createThemedStyleSheet: <T extends AnyStyleSheet>(
    styles: (theme: ProcessedThemeConfig<TList, TConfig>) => T
  ) => T
  readonly th: (render: (theme: ProcessedThemeConfig<TList, TConfig>) => ReactNode) => ReactNode
}
