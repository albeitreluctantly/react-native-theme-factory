# react-native-theme-factory
Utility for easy creation and usage of custom themes for React Native applications

What's this?

A utility that helps to create fully customized themes for React Native applications, providing a variety of ways to use the resulting theme.

What are the features?

- Strong typing. You don't have to use strings or selection from objects by key or remember all the deeply nested objects names you may create like "theme.colors.surface.cards.faint".
- Different ways to use the resulting theme. Utility doesn't bind you to use certain methods of binding components to theme, but provides a wide range of possibilities. It has hooks and HOC's and builders and whatever you may want)
- Possibility of creating a multitude of different themes and easily switching between them. Not only light and dark themes, you are free to define as many as you want. All of the usage variants are described below with examples.

How did you achieve this, what's the working principle and why did you choose it?

I was thinking about how to create a convenient strongly typed theme creation utility which can be used across projects, encapsulates all the logic and leaves only to create configuration for the specific app. The most common way to make utils of such type is to use context with hooks. But i knew that if i had created a context which receives a custom themes configuration as a prop, it wouldn't have exposed it's types to consumer components via "useTheme". So in this case i would have to create custom hooks for each app, like "useAppTheme", providing it with types i want and it all would look like a mess a bit. So i ended up using abstract factory pattern and javascript's reference equality peculiarities to create a function that takes configuration and creates all the tools for theme usage and switching with types infered from the given config.
