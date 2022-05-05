import Hook, {useState, useEffect, useRef} from "../../index.js";


function DemoWrapperWrapper() {
    return <>Mount</>;
}

Hook.render(<DemoWrapperWrapper/>, document.getElementById('sandbox-container'));
