export function bench(renderFns, repeats) {
    const timeTable = renderFns.map((fn, index) => ({
        name: fn.name || index,
        times: []
    }));

    const run = (renderIndex) => {
        if (renderIndex < renderFns.length) {
            const timeStart = performance.now();
            const onFinish = () => {
                timeTable[renderIndex].times.push(performance.now() - timeStart);
                setTimeout(() => {
                    run(renderIndex + 1);
                });
            };
            renderFns[renderIndex](onFinish);
        } else {
            if (--repeats > 0) {
                setTimeout(() => {
                    run(0);
                });
            } else {
                printOutput(timeTable);
            }
        }
    };

    run(0);
}

function printOutput(timeTable) {
    const tableData = [];
    timeTable.forEach(({name, times}) => {
        tableData.push({
            "Name": name,
            "Repeats": times.length,
            "Avg Time": average(times),
            "Med Time": median(times),
            "Min Time": Math.min(...times),
            "Max Time": Math.max(...times),
        });
    });
    console.table(tableData);
    console.log(timeTable);
}

function median(values) {
    values.sort(function (a, b) {
        return a - b;
    });

    var half = Math.floor(values.length / 2);

    if (values.length % 2 !== 0) {
        return values[half];
    }

    return (values[half - 1] + values[half]) / 2.0;
}

function average(values) {
    return values.reduce((a, b) => a + b, 0) / values.length;
}
