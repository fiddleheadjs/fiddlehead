export function bench(renderFns, repeats) {
    const timeTable = renderFns.map(() => []);

    const run = (index) => {
        if (index < renderFns.length) {
            const timeStart = performance.now();
            const onFinish = () => {
                timeTable[index].push(performance.now() - timeStart);
                setTimeout(() => {
                    run(index + 1);
                }, 300);
            };
            renderFns[index](onFinish);
        } else {
            if (--repeats > 0) {
                setTimeout(() => {
                    run(0);
                }, 300);
            } else {
                printOutput(timeTable);
            }
        }
    };

    run(0);
}

function printOutput(timeTable) {
    const tableData = [];
    timeTable.forEach((times) => {
        tableData.push({
            "Repeats": times.length,
            "Avg Time": average(times),
            "Med Time": median(times),
            "Min Time": Math.min(...times),
            "Max Time": Math.max(...times),
        });
    });
    console.table(tableData);
    console.log(tableData);
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
