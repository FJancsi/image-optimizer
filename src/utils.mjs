const clamp = (v, min, max) => {
    if (v < min) {
        return min;
    }
    if (v > max) {
        return max;
    }
    return v;
};

const suffix = ["B", "KB", "MB"];

const prettyPrintSize = (size) => {
    const base = Math.floor(Math.log2(size) / 10);
    const index = clamp(base, 0, 2);
    return (size / 2 ** (10 * index)).toFixed(2) + suffix[index];
};

const getPercentageIncrease = (outputSize, resultSize) => {
    return (outputSize / resultSize) * 100;
};

const prettyPrintPercentage = (outputSize, resultSize) => {
    return `${getPercentageIncrease(outputSize, resultSize).toPrecision(3)} %`;
};

export { prettyPrintSize, prettyPrintPercentage };
