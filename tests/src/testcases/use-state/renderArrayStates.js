import {jsx, useState} from 'core.pkg';

export const arrayMock = [
    {
        content: 'string',
        class: 'item-string',
        style: {
            color: 'red',
        }
    },
    { content: 1, class: 'item-number' },
    { content: null, class: 'item-null' },
    { content: undefined, class: 'item-undefined' },
    {
        content: function () {
            return 'function';
        },
        class: 'item-function',
    },
    { content: [1, 'item', 2], class: 'item-array' },
    { content: {}, class: 'item-object' },
];

function Item({children, className, style}) {
    return <div style={style} data-testid={className}>
        {children}
    </div>;
}

export function Root({getMockValue}) {
    const [array, setArray] = useState(arrayMock);

    return (
        <>
            <div data-testid="items"
                onClick={() => setArray(getMockValue())}
            >
                {array.map(item => {
                    return (
                        <Item className={item.class} style={item.style}>{item.content}</Item>
                    );
                })}
            </div>
        </>
    );
}
