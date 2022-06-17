# Hook

Hook is a lightweight UI library. It replicates some key features of React:

- Declarative programming
- One-way data binding
- Reconciliation
- Batch update
- Error boundary

## Install

Install the library:

```
npm install git+ssh://git@git.itim.vn:ads-frontend/hook.git
```

Install Babel's packages to use JSX syntax:

```
npm install babel-loader @babel/core @babel/plugin-transform-react-jsx @babel/preset-env
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
import {jsx, render} from 'hook';

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
import {jsx, useState} from 'hook';

function Counter() {
    const [count, setCount] = useState(0);
    
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
import {jsx, useState, useEffect} from 'hook';

function UserInfo() {
    const [email, setEmail] = useState('');
    const [info, setInfo] = useState(null);
    
    useEffect(() => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/user/info');
        xhr.onload = () => {
            setInfo(xhr.responseText);
        };
        xhr.send('email=' + email);
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

The signature is identical to `useEffect`, but it fires synchronously after all DOM mutations. Use this to read layout from the DOM and synchronously re-render. Updates scheduled inside `useLayoutEffect` will be flushed synchronously, before the browser has a chance to paint.

Prefer the standard `useEffect` when possible to avoid blocking visual updates.

### useRef

```jsx
import {jsx, useEffect, useRef} from 'hook';

function Image() {
    const imageRef = useRef(null);

    useEffect(() => {
        const image = imageRef.current;

        // Do something with the native image element
        console.log(image.naturalWidth, image.naturalHeight);
    }, []);

    return (
        <img ref={imageRef} src="/path/to/image.png"/>
    );
}
```

### Forward refs

Don't like React, `ref` property can be accessed inside the component. You also don't need `forwardRef()` at all.

```jsx
import {jsx, useRef} from 'hook';

function TextInput({ref}) {
    return (
        <input ref={ref}/>
    );
}

function App() {
    const inputRef = useRef(null);
    
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
import {jsx, useError} from 'hook';

function ErrorBoundary({children}) {
    const [error, clearError] = useError();

    if (error !== null) {
        return 'Oops... Something went wrong!';
    }

    return children;
}
```

Error boundaries catch errors during rendering, in hooks and in the whole tree below them. Error boundaries allow only one `useError` inside.

### Portal

```jsx
import {jsx, createPortal} from 'hook';

function DocumentPortal({children}) {
    const elRef = useRef(document.createElement('div'));
    elRef.current.style.display = 'contents';
    
    useEffect(() => {
        if (elRef.current.parentNode === null) {
            document.body.appendChild(elRef.current);
        }
        return () => {
            if (elRef.current.parentNode !== null) {
                elRef.current.parentNode.removeChild(elRef.current);
            }
        };
    }, []);

    return createPortal(children, elRef.current);
}

function App() {
    const [showsImage, setShowsImage] = useState(false);

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
