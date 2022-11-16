import { optimizeImages } from "./src/optimize-images.mjs";

const main = async () => {
    await optimizeImages({
        dirName: process.env.DIR_NAME,
    });
};

await main();
