# Hook

A lightweight library renders HTML by JS. It replicates some key features of React:

- Declarative programming
- One-way data binding
- State management with hooks: useState, useEffect, useRef
- Reconcilication

## Install

Let's say we will locate the library in: path/to/hook

```
git submodule add git@git.itim.vn:ads-frontend/hook.git path/to/hook
```

To use JSX syntax:

```
npm install babel-loader @babel/core @babel/plugin-transform-react-jsx @babel/preset-env
```

Webpack config:

```js
function getJsLoaders() {
    return [
        {
            loader: 'babel-loader',
            options: {
                presets: [
                    '@babel/preset-env',
                ],
                plugins: [
                    [
                        "@babel/plugin-transform-react-jsx",
                        {
                            "pragma": "Hook.$",
                            "pragmaFrag": "null"
                        }
                    ],
                ],
            }
        }
    ];
}

module.exports = {
    //...
    module: {
        rules: [
            {
                test: /\.js$/,
                use: getJsLoaders()
            },
            //...
        ],
    },
};
```

## Usage

### Basic usage

```jsx
import Hook from 'path/to/hook';

export default function HelloWorld() {

    return <div className="HelloWorld">
        <h1>Hello World!</h1>
    </div>;
}
```

### State management

```jsx
import Hook, {useState} from 'path/to/hook';

export default function Counter() {
    const [count, setCount] = useState(0);
    
    return <div className="Counter">
        <div>Count: {count}</div>
        <div>
            <button
                type="button"
                onClick={ev => {
                    setCount(count => count + 1);
                }}
            />
        </div>
    </div>;
}
```

```jsx
import Hook, {useState, useEffect} from 'path/to/hook';

export default function UserInfo() {
    const [email, setEmail] = useState('');
    const [info, setInfo] = useState(null);
    
    useEffect(() => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://...');
        xhr.onload = () => {
            setInfo(xhr.responseText);
        };
        xhr.send('email=' + email);
    }, [email]);
    
    return <div className="UserInfo">
        <input
            type="text"
            onChange={ev => {
                setEmail(ev.target.value);
            }}
        />
        {
            info !== null &&
            <div>
                {info}
            </div>
        }
    </div>;
}
```
