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

Install Fiddlehead:

```bash
npm install fiddlehead
```

Install Babel's packages to use JSX syntax:

```bash
npm install -D babel-preset-fiddlehead babel-loader
```

## Configuration

`.babelrc`

```json
{
    "presets": ["babel-preset-fiddlehead"]
}
```

`webpack.config.js`

```js
module.exports = {
    //...
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: ['babel-loader']
            },
            //...
        ],
    },
};
```

## APIs

### render

```jsx
import {render} from 'fiddlehead';

// Declare your component
function HelloWorld() {
    return <h1>Hello World!</h1>;
}

// Render your component into a DOM element (#root)
render(<HelloWorld/>, document.getElementById('root'));
```

### useState

```jsx
import {useState} from 'fiddlehead';

function Counter() {
    let [count, setCount] = useState(0);
    
    return (
        <div>
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
import {useState, useEffect} from 'fiddlehead';

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
        <div>
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
import {useEffect, useRef} from 'fiddlehead';

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

### useCatch

You may want your application to handle unexpected errors in runtime,
then show a user-friendly message instead of a blank screen,
while reporting errors to a logging service in the background.

To support that purpose, Fiddlehead provides you `useCatch` hook.
`useCatch` catches errors during rendering, in hook callbacks, and in the whole subtree below.
`useCatch` does not catch errors in event listeners, AJAX handlers,...

The component implements `useCatch` hook works as an error boundary.
Each error boundary allows only one `useCatch` inside.

```jsx
import {useCatch} from 'fiddlehead';

function ErrorBoundary({children}) {
    let [error, clearError] = useCatch();

    if (error !== null) {
        return 'Oops... Something went wrong!';
    }

    return children;
}
```

### createPortal

`createPortal` allows you to create a portal to split the subtree bellow from the native DOM tree to somewhere outside.

It is helpful when you want to create components that appear above others like Modal, Popover, Dropdown, Tooltip, and so on.

```jsx
import {createPortal} from 'fiddlehead';

function DocumentPortal({children}) {
    let el = useRef(document.createElement('div')).current;
    
    useEffect(() => {
        if (el.parentNode === null) {
            el.style.display = 'contents';
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

### useCallback

When you pass an inline function to a child component, that child component will always re-render
when the current component re-renders, because the inline function is always a different instance.

Wrapping that function with the useCallback hook helps you access the existing instance instead of
using the new instance of the function, thereby, the child component will not re-render unintentionally.

In the following example, whenever the App component re-renders, the Form component also re-renders following
unintentionally, because the function passed to onSubmit prop always is a different function.

```jsx
import {useState} from 'fiddlehead';

function App() {
    let handleSubmit = () => {
        // ...
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

Wrap the inline function within `useCallback` to avoid re-rendering:

```jsx
import {useState, useCallback} from 'fiddlehead';

function App() {
    let handleSubmit = useCallback(() => {
        // ...
    }, []);

    // ...
}
```

### useMemo

This hook is used to avoid re-running a heavy calculation every time the component re-renders.

```jsx
import {useMemo} from 'fiddlehead';

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
import {useStoreInit, useStoreRead, useStoreWrite} from 'fiddlehead/store';

function App() {
    useStoreInit(
        App, // Scope, can be any reference-type value (object, function,...)
        {title: 'Store usage example'} // Initial data, a reference-type value
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

## Working with HTML elements

### class and className

Fiddlehead supports both `class` and `className`, they are identity.

- Why `class`? It makes your code more like HTML
- Why `className`? It is an property of HTMLElement

```jsx
<div class="banner" />
// equals to
<div className="banner" />
```

### style

Unlike writing CSS in HTML, you need to pass an object with keys are style properties (camelCase),
instead of a string, to the `style` property.

```jsx
<div style={{
    marginTop: '100px',
    padding: '1em 2em',
    fontWeight: 'bold',
    zIndex: 100,
}} />
```

### innerHTML

You can set `innerHTML` normally as other properties.

**Warning:** There are potential security vulnerabilities when you set `innerHTML` by a user-entered text without encoding special characters.
Please make sure that you know what you do!

```jsx
<div innerHTML={markdown2html(content)} />
```

### Event listeners

Say, we want to do something when a user clicks on an element:

```jsx
let handleClick = (event) => {
    event.preventDefault();
    //...
};
```

When we work with plain JavaScript, we can set an event listener like this:

```jsx
let link = document.createElement('a');
link.textContent = 'Homepage';
link.onclick = handleClick;
```

Setting an event listener in Fiddlehead is similar, except event names are written in camelCase style:

```jsx
<a onClick={handleClick}>
    Homepage
</a>
```

## Some notes

### Forwarding refs

Different from React, Fiddlehead does not prevent you from using `ref` as a normal prop.
You are free to choose the name of the prop which forwards the ref.
As you pass that prop to a built-in element, it requires you to provide an instance of Ref,
which you will get by using the `createRef` function or `useRef` hook.

```jsx
import {useRef} from 'fiddlehead';

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

### Fiddlehead components always are "pure"

Pure components are components that always produce the same output (view) with the same input (props).
Different from React, any components of Fiddlehead are pure without wrapping them with `memo` HOC.
This means, components will not re-rendered without changes in their props or states,
even when their parent components re-rendered.
We use the shallow comparison to determine if props are changed or not.
