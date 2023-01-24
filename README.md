# Fiddlehead

[![GitHub license](https://img.shields.io/badge/license-MIT-green.svg?logo=github)](https://github.com/CocCoc-Ad-Platform/fiddlehead/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/fiddlehead.svg?color=green&logo=npm)](https://www.npmjs.com/package/fiddlehead) [![bundle size](https://img.shields.io/github/size/CocCoc-Ad-Platform/fiddlehead/lib/core/esm.production.min.js?color=green)](https://github.com/CocCoc-Ad-Platform/fiddlehead/blob/master/lib/core/esm.production.min.js)

Fiddlehead is a UI library that allows you to develop web apps in the declarative style,
component-based - these make your lines of code more predictable and maintainable.

If you are familiar with React before, using Fiddlehead is quite similar.
It implements some of the main ideas of React: virtual DOM, functional components, and hooks.

Writing codes with Fiddlehead is nothing but JSX and hooks.
It is aimed to be as simple as possible, while still providing an excellent development experience.
With such criteria in mind, we made it some benefits:
- Simple usage: only JSX and hooks
- Performant: use only 50% memory, and slightly better CPU usage compared to React
- Lightweight: only 8kb (or 3kb gzipped), compared to 132kb for React

[Try it on CodeSandbox](https://codesandbox.io/s/fiddlehead-stateful-component-d5pg76?from-embed)

## Documentation

**[➡️ Go to the Fiddlehead documentation website (Beta)](https://fiddleheadjs.com)**

Some helpful links to get started:

- [Installation](https://fiddleheadjs.com/Guides/Setup-Project)
- [APIs](https://fiddleheadjs.com/API)
- [Writing HTML in JSX](https://fiddleheadjs.com/Guides/Writing-HTML-in-JSX)

## Why this project exists?

### Motivation

- We love React APIs, especially, hooks
- But we cannot use React for some projects as they are required to be very lightweight
- We planned to build a simple library that is similar in usage to React
- Then, after many challenges, it is done
- The result is much better than our first expectation
- It is not only much smaller in size, but faster and saves more memory than React

### Why to choose Fiddlehead

- Tiny: only 8kb (or 3k gzipped)
- Performant: faster and less memory usage
- Only JSX and hooks. No class components.
- Very similar usage to React.
- No need to use HOCs: `forwardRef`, `memo`
- Store: Global state management

## License

Fiddlehead is [MIT-licensed](./LICENSE) open-source software.
