import { jsx } from "hook";

export function Root() {
    return (
        <div data-testid="set-state">
            This is div tag
            <p data-testid="p">
                <span data-testid="span">This is span tag</span>
                This is p tag
                <custom-tag data-testid="custom-tag" attr-test="attr-test">
                    <p data-testid="p">
                        <image data-testid="image" src="http://i.imgur.com/w7GCRPb.png" />
                    </p>
                </custom-tag>
            </p>
            <div data-testid="div">
                <input data-testid="input-text" readOnly="readOnly" type="text" placeHolder="This input tag"/>
                <div data-testid="div">
                    <table data-testid="table">
                        <tbody data-testid="tbody">
                            <tr data-testid="tr">
                                <td data-testid="td"></td>
                                <tbody data-testid="tbody">
                                    <custom-tag data-testid="custom-tag" attr-test="attr-test"></custom-tag>
                                </tbody>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <select>
                {[1, 2, 3, 4, 5].map(({ _, value }) => {
                    return <option data-testid="option">{value}</option>;
                })}
            </select>
        </div>
    );
}
