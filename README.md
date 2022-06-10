# Hook

Hook is a lightweight UI library. It replicates some key features of React:

- Declarative programming
- One-way data binding
- Reconcilication
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
    
    useEffect(function () {
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

### useRef

```jsx
import {jsx, useEffect, useRef} from 'hook';

function Image() {
    const imageRef = useRef(null);

    useEffect(function () {
        const image = imageRef.current;

        // Do something with the native image element
        console.log(image.naturalWidth, image.naturalHeight);
    }, []);

    return (
        <image ref={imageRef} src="/path/to/image.png"/>
    );
}
```
