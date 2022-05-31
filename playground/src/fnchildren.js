import {jsx, mount, useState, useEffect, useRef} from "../../output";

function Form({children}) {
    return (
        children(10)
    );
}

function DemoWrapperWrapper() {
    return (
        <main>
            {
                <Form>
                    {(count) => {
                        return `Count ${count}`;
                    }}
                </Form>
            }
        </main>
    );
}

mount(<DemoWrapperWrapper />, document.getElementById('sandbox-container'));
