# Fiddlehead

[![GitHub license](https://img.shields.io/badge/license-MIT-green.svg?logo=github)](https://github.com/CocCoc-Ad-Platform/fiddlehead/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/fiddlehead.svg?color=green&logo=npm)](https://www.npmjs.com/package/fiddlehead) [![bundle size](https://img.shields.io/github/size/CocCoc-Ad-Platform/fiddlehead/lib/core/esm.production.js?color=green)](https://github.com/CocCoc-Ad-Platform/fiddlehead/blob/master/lib/core/esm.production.js)

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

## Installation

Install the library:

```
npm install fiddlehead
```

Install Babel's packages to use JSX syntax:

```
npm install babel-loader @babel/core @babel/preset-env @babel/plugin-transform-react-jsx
```

## Configuration

### babel.config.json

```json
{
    "presets": ["@babel/preset-env"],
    "plugins": [
        ["@babel/plugin-transform-react-jsx", {
            "pragma": "jsx",
            "pragmaFrag": "'['"
        }],
    ],
}
```

### webpack.config.js

```js
module.exports = {
    //...
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: require('./babel.config.json')
                    }
                ]
            },
            //...
        ],
    },
};
```

## Usage

### Basic usage

```jsx
import {jsx, render} from 'fiddlehead';

// Declare your component
function HelloWorld() {
    return (
        <div className="HelloWorld">
            <h1>Hello World!</h1>
        </div>
    );
}

// Render your component into a DOM element (#root)
render(<HelloWorld/>, document.getElementById('root'));
```

### useState

```jsx
import {jsx, useState} from 'fiddlehead';

function Counter() {
    let [count, setCount] = useState(0);
    
    return (
        <div className="Counter">
            <div>Count: {count}</div>
            <div>
                <button
                    type="button"
                    onClick={() => {
                        setCount(count => count + 1);
                    }}
                />
            </div>
        </div>
    );
}
```

### useEffect

```jsx
import {jsx, useState, useEffect} from 'fiddlehead';

function UserInfo() {
    let [email, setEmail] = useState('');
    let [info, setInfo] = useState(null);
    
    useEffect(() => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/user/info');
        xhr.onload = () => {
            setInfo(xhr.responseText);
        };
        xhr.send('email=' + email);
        
        return () => {
            xhr.abort();
        };
    }, [email]);
    
    return (
        <div className="UserInfo">
            <input
                type="text"
                onChange={ev => {
                    setEmail(ev.target.value);
                }}
            />
            {info !== null && (
                <p>{info}</p>
            )}
        </div>
    );
}
```

### useLayoutEffect

The signature is identical to `useEffect`, but it fires synchronously after all DOM mutations.
Use this to read layout from the DOM and synchronously re-render.
Updates scheduled inside `useLayoutEffect` will be flushed synchronously, before the browser has a chance to paint.

Prefer the standard `useEffect` when possible to avoid blocking visual updates.

### useRef

```jsx
import {jsx, useEffect, useRef} from 'fiddlehead';

function Image() {
    let imageRef = useRef(null);

    useEffect(() => {
        let image = imageRef.current;

        // Do something with the native image element
        console.log(image.naturalWidth, image.naturalHeight);
    }, []);

    return (
        <img ref={imageRef} src="/path/to/image.png"/>
    );
}
```

### Forward refs

Different from React, fiddlehead does not prevent you from using `ref` as a normal prop.
You are free to choose the name of the prop which forwards the ref.
As you pass that prop to a built-in element, it requires you to provide an instance of Ref,
which you will get by using the `createRef` function or `useRef` hook.

```jsx
import {jsx, useRef} from 'fiddlehead';

function TextInput({ref}) {
    return (
        <input ref={ref}/>
    );
}

function App() {
    let inputRef = useRef(null);
    
    useEffect(() => {
        console.log('Input element', inputRef.current);
    }, []);

    return (
        <TextInput ref={inputRef}/>
    );
}
```

### Error boundaries

```jsx
import {jsx, useCatch} from 'fiddlehead';

function ErrorBoundary({children}) {
    let [error, clearError] = useCatch();

    if (error !== null) {
        return 'Oops... Something went wrong!';
    }

    return children;
}
```

Error boundaries catch errors during rendering, in hook callbacks and in the whole tree below them.
Error boundaries allow only one `useCatch` inside.

### Portal

```jsx
import {jsx, createPortal} from 'fiddlehead';

function DocumentPortal({children}) {
    let el = useRef(document.createElement('div')).current;
    el.style.display = 'contents';
    
    useEffect(() => {
        if (el.parentNode === null) {
            document.body.appendChild(el);
        }
        return () => {
            if (el.parentNode !== null) {
                el.parentNode.removeChild(el);
            }
        };
    }, []);

    return createPortal(children, el);
}

function App() {
    let [showsImage, setShowsImage] = useState(false);

    return (
        <div>
            <button onClick={() => setShowsImage(true)}>
                Show Image
            </button>
            {showsImage && (
                <DocumentPortal>
                    <div className="modal">
                        <img src="/path/to/image.png"/>
                    </div>
                </DocumentPortal>
            )}
        </div>
    );
}
```

### Components always are "pure"

Pure components are components that always produce the same output (view) with the same input (props).
Different from React, any components of Fiddlehead are pure without wrapping them with `memo` HOC.
This means, components will not re-rendered without changes in their props or states,
even when their parent components re-rendered.
We use the shallow comparison to determine if props are changed or not.

### useCallback

When you pass an inline function to a child component, that child component will always re-render
when the current component re-renders, because the inline function is always a different instance.

Wrapping that function with the useCallback hook helps you access the existing instance instead of
using the new instance of the function, thereby, the child component will not re-render unintentionally.

In the following example, whenever the App component re-renders, the Form component also re-renders following
unintentionally, because the function passed to onSubmit prop always is a different function.

```jsx
import {jsx, useState} from 'fiddlehead';

function App() {
    let handleSubmit = () => {
        // Submit values
    };

    return (
        <div>
            <Form onSubmit={handleSubmit} />
        </div>
    );
}

function Form({onSubmit}) {
    // ...
}
```

Wrap the inline function within `useCallback` to avoid this:

```jsx
import {jsx, useState, useCallback} from 'fiddlehead';

function App() {
    let handleSubmit = useCallback(() => {
        // Submit values
    }, []);

    // ...
}
```

### useMemo

This hook is used to avoid re-running a heavy calculation every time the component re-renders.

```jsx
import {jsx, useMemo} from 'fiddlehead';

function App() {
    let result = useMemo(() => {
        // Run heavy tasks
        return result;
    }, []);

    // ...
}
```

### Store

Store is a separated package. It is helpful when we want to use some global states,
which can be read/written from anywhere in the DOM tree, with no need to pass props through all levels of elements. 

```jsx
import {jsx, useRef} from 'fiddlehead';
import {useStoreInit, useStoreRead, useStoreWrite} from 'fiddlehead/store';

function App() {
    useStoreInit(
        App, // Scope, can be any object (reference) but not a primitive value
        {title: 'Store usage example'} // Initial data, must be a plain object
    );

    return (
        <main>
            <Header/>
            <section>
                <Form/>
            </section>
        </main>
    );
}

function Header() {
    let title = useStoreRead(
        App, // Scope
        (data) => data.title // Reader
    );

    return (
        <h1>{title}</h1>
    );
}

function Form() {
    let title = useStoreRead(App, (data) => data.title);
    let setTitle = useStoreWrite(
        App, // Scope
        (data, value) => data.title = value // Writer
    );

    return (
        <input
            type="text"
            value={title}
            onChange={ev => setTitle(ev.target.value)}
        />
    );
}
```
