<h1>What's this?</h1>

A utility that helps to create fully customized themes for React Native applications, providing a variety of ways to use the resulting theme.

<h1>What are the features?</h1>

- Strong typing. You don't have to use strings or selection from objects by key or remember all the deeply nested objects names you may create like "theme.colors.surface.cards.faint".
- Different ways to use the resulting theme. Utility doesn't bind you to use certain methods of binding components to theme, but provides a wide range of possibilities. It has hooks and HOC's and builders and whatever you may want)
- Possibility of creating a multitude of different themes and easily switching between them. Not only light and dark themes, you are free to define as many as you want. All of the usage variants are described below with examples.

<h1>How did you achieve this, what's the working principle and why did you choose it?</h1>

I was thinking about how to create a convenient strongly typed theme creation utility which can be used across projects, encapsulates all the logic and leaves only to create configuration for the specific app. The most common way to make utils of such type is to use context with hooks. But i knew that if i had created a context which receives a custom themes configuration as a prop, it wouldn't have exposed it's types to consumer components via "useTheme". So in this case i would have to create custom hooks for each app, like "useAppTheme", providing it with types i want and it all would look like a mess a bit. And i also wanted to be able to use theme not only in components, but also in StylesSheet.create so as to not write [styles.container, {color: theme.colors.background}] everytime. So i ended up using abstract factory pattern and javascript's reference equality peculiarities to create a function that takes configuration and creates all the tools for using and switching the theme, created specifically for the given configuration.

<h1>Usage</h1>
First create a list of your themes which can be Enum or object and a config with your themes properties.

In config you have to set the desired properties for each theme specified in your themes list by making that property an object
with keys corresponding to themes names. See (1) in the following code fragment. The fabric will process that properties so that
in result each theme will get its own value and you will be able to use it like 'theme.colors.background', not 'theme.colors.backgroud.light/dark'.

I thought this is more convenient than creating a separate config for each theme. Otherwise you would have to create, for example, light theme object
and then dark theme as a separate object extending light by destucturing and replacing properties. Or do the same with classes by extending. And with
many nested objects it would get quite complicated.

So the example of config:

```ts
const themesConfig = {
  colors: {
    primary: '#ff0000',
    secondary: '#00ff00',
    // 1
    background: {
      light: '#fff',
      dark: '#111'
    }
  },
  layout: {
    edgeInsets: {
      small: 5,
      regular: 15,
      large: 20
    }
  }
}
enum Theme {
  Light = 'light',
  Dark = 'dark'
}
```

Then you have to pass it to the factory.

```ts
createThemeFactory(Theme, themesConfig)
```

Factory will make all the job and return all the needed tools which you can export to use throughout the app.

```ts
export const {
  config: theme,
  getCurrentTheme,
  setCurrentTheme,
  listenToThemeChange,
  useTheme,
  withTheme,
  createThemedStyleSheet,
  th
} = createThemeFactory(Theme, themesConfig)
```

Then you can use theme in your components through different ways:

<h2>Just use values from config.</h2>
If you're not planning to change theme on the fly or in specific component you use only property/ies that are not
subject to change, you can end on this.
You are also free to destructure any nested objects from your config and export them from the configuration file to then use it through the
application as 'colors.background', not 'theme.colors.background'.
```ts
import { theme } from './theme'

const DemoComponent = () => {
  return <View style={{ backgroundColor: theme.colors.background }} />
}
```

<h2>useTheme hook</h2>

```ts
const HookDemoComponent = () => {
  const { colors } = useTheme()
  return <View style={{ backgroundColor: colors.background }} />
}
```
<h2>withTheme HOC</h2>

```ts
const HOCDemoComponent = withTheme(({ theme: { colors } }) => {
  return <View style={{ backgroundColor: colors.background }} />
})
```

<h2>StyleSheet</h2>

```ts
const StyleSheetDemoComponent = withTheme(({ theme: { colors } }) => {
  return <View style={styles.container} />
})

const styles = createThemedStyleSheet(theme => ({
  container: {
    backgroundColor: theme.colors.background
  }
}))
```

To make component react to theme changes you can use different ways:

If you use theme through 'useTheme' or 'withTheme', it's okay and you dont have to do anything else.

If you use config directly or you use stylesheet you must use either 'withTheme' or 'useTheme' to make component react to changes.
Here are the examples:
```ts
const ReactingDemoComponent1 = () => {
  useTheme()

  return <View style={{ backgroundColor: colors.background }} />
}

const ReactingDemoComponent2 = withTheme(() => {
  return <View style={{ backgroundColor: colors.background }} />
})

const ReactingDemoComponent3 = () => {
  useTheme()

  return <View style={styles.container} />
}

const ReactingDemoComponent4 = withTheme(() => {
  return <View style={styles.container} />
})

const styles = createThemedStyleSheet(theme => ({
  container: {
    backgroundColor: theme.colors.background
  }
}))
```

There is also one more option - 'theme builder'

```ts
const ReactingDemoComponent5 = () => {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header />
      {th(theme => (
        <View style={{ backgroundColor: colors.primary }} />
      ))}
      {/* A lot of contents here */}
      <Footer />
    </View>
  )
}
```

<h1>License</h1>

MIT. Feel free to use. But i'm not responsible for any money loss, anyone got fired, any fall of civilizations and intergalactic wars happened due to use of this plugin)
