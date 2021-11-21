<h1>What's this?</h1>

A utility that helps to create fully customized themes for React Native applications, providing a variety of ways to use the resulting theme.

<h1>Precautions</h1>

1) Before writing anything further i want to apologize for my English cause i'm not a native speaker.
2) It's quite a raw version of readme yet, i will make it look more neat later.
3) The library itself hasn't been very well tested so there can be bugs. Send me an issue if you found one.

<h1>What are the features?</h1>

- <b>Strong typing</b>. You don't have to use strings or selection from objects by key or remember all the deeply nested objects names you may create like "theme.colors.surface.cards.faint".
- <b>Different ways to use the resulting theme</b>. Utility doesn't bind you to use certain methods of binding components to theme, but provides a wide range of possibilities. It has hooks and HOC's and builders and whatever you may want)
- <b>Possibility of creating a multitude of different themes and easily switching between them.</b> Not only light and dark themes, you are free to define as many as you want. All of the usage variants are described below with examples.

<h1>How did you achieve this, what's the working principle and why did you choose it?</h1>
<p>I was thinking about how to create a convenient strongly typed theme creation utility which can be used across projects, encapsulates all the logic and leaves only to create configuration for the specific app. The most common way to make utils of such type is to use context with hooks. But i knew that if i had created a context which receives a custom themes configuration as a prop, it wouldn't have exposed it's types to consumer components via "useTheme". So in this case i would have to create custom hooks for each app, like "useAppTheme", providing it with types i want and it all would look like a mess a bit. And i also wanted to be able to use theme not only in components, but also in StylesSheet.create so as to not write [styles.container, {color: theme.colors.background}] everytime. So i ended up using abstract factory pattern and javascript's reference equality peculiarities to create a function that takes configuration and creates all the tools for using and switching the theme, created specifically for the given configuration.</p>

<h1>Usage</h1>

<h2>1) Create a list of themes and a config</h2>

<p>Create a list of your themes which can be Enum or object and a config with your themes properties.
In config you have to set the desired properties for each theme specified in your themes list by making that property an object
with keys corresponding to themes names. See (1) in the following code fragment. The fabric will process that properties so that
in result each theme will get its own value and you will be able to use it like 'theme.colors.background', not 'theme.colors.backgroud.light/dark'.</p>
<p><i>
I thought this is more convenient than creating a separate config for each theme.
Otherwise you would have to create, for example, light theme object and then dark theme
as a separate object extending light by destucturing and replacing properties.
Or do the same with classes by extending. And with many nested objects it would get quite complicated.
</i></p>

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

<h2>2) Pass it to the factory</h2>

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

<h2>3) Use it in your app</h2>
<p>
- R mark means this way component reacts to theme changes</br>
- NR means that it doesn't</br>
The explanation is given in section 4)
</p>

There are different ways to use theme in your components:

<h3>3.1) Just use values from config. (NR)</h3>
<p><i>You are free to destructure any nested objects from your config and export them from the configuration file to then use it through the
application as 'colors.background', not 'theme.colors.background'.</i></p>

```ts
import { theme } from './theme'

const DemoComponent = () => {
  return <View style={{ backgroundColor: theme.colors.background }} />
}
```

<h3>3.2) useTheme hook (R)</h3>

```ts
const HookDemoComponent = () => {
  const { colors } = useTheme()
  return <View style={{ backgroundColor: colors.background }} />
}
```
<h3>3.3) withTheme HOC (R)</h2>

```ts
const HOCDemoComponent = withTheme(({ theme: { colors } }) => {
  return <View style={{ backgroundColor: colors.background }} />
})
```

<h3>3.4) Stylesheet (NR)</h3>

```ts
const StyleSheetDemoComponent = () => {
  return <View style={styles.container} />
}

const styles = createThemedStyleSheet(theme => ({
  container: {
    backgroundColor: theme.colors.background
  }
}))
```
<h3>3.5) Builder (R)</h3>
I know it's not a very 'React-ish' style, but i know such option and you have the option)

```ts
const BuilderDemoComponent = () => {
  return (
    <View>
      {/* Other components here  */}
      {th(theme => (
        <View style={{ backgroundColor: theme.colors.primary }} />
      ))}
      {/* A lot of contents here */}
    </View>
  )
}
```
<h2>4) Reaction to changes</h2>
<p>If you're not planning to change theme on the fly or in certain component you use only property/ies that are not subject to change, you can just use theme config directly or through stylesheet.</p>
<p>To make component react to theme changes you must use either useTheme, withTheme or builder.</p>
<p>You can combine usage ways as you want, here are the examples:</p>

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

MIT. Feel free to use if you didn't get scared by all the written above or by looking into the code) But i'm not responsible for any money loss, anyone got fired, any fall of civilizations and intergalactic wars caused by using this plugin)
