import { ImagePool } from "@squoosh/lib";
import { cpus } from "os";
import { readFile, writeFile, readdir } from "fs/promises";
import path from "path";
import { prettyPrintSize, prettyPrintPercentage } from "./utils.mjs";
import { SUPPORTED_IMAGES } from "./const.mjs";

const getOptions = async () => {
    try {
        return JSON.parse(
            await readFile(path.join(process.cwd(), "./config.json"), "utf-8")
        );
    } catch (error) {
        console.error(`## Could not read the config file: ${error}`);
    }
};

const getFiles = async ({ dirName }) => {
    try {
        let validFiles = [];
        const items = await readdir(dirName, { withFileTypes: true });
        for (const item of items) {
            const filePath = `${dirName}/${item.name}`;
            if (item.isDirectory()) {
                validFiles = [
                    ...validFiles,
                    ...(await getFiles({ dirName: filePath })),
                ];
            } else {
                if (SUPPORTED_IMAGES.includes(path.extname(filePath))) {
                    validFiles.push(filePath);
                }
            }
        }

        return validFiles;
    } catch (error) {
        console.error(`Something went wrong while reading files: ${error}`);
    }
};

const optimizeImage = async ({ path, option }) => {
    try {
        const threads = cpus().length;
        console.log(`# Start Processing - ${path} (${threads} threads)`);
        const imagePool = new ImagePool(threads);
        const file = await readFile(path);
        const image = imagePool.ingestImage(file);
        const { preprocessOpt, encodeOpt } = option;
        const { size: sizeBefore } = await image.decoded;

        if (preprocessOpt) {
            await image.preprocess(preprocessOpt);
        }

        await image.encode(encodeOpt);
        const [encoderName] = Object.keys(encodeOpt);
        const { binary, size: sizeAfter } = await image.encodedWith[encoderName];

        console.log(
            `## Processing is done: ${prettyPrintSize(
                sizeBefore
            )} -> ${prettyPrintSize(sizeAfter)} (${prettyPrintPercentage(
                sizeAfter,
                sizeBefore
            )})`
        );
        await writeFile(path, binary);

        await imagePool.close();
    } catch (error) {
        console.error(`## Something went wrong while optimize an image: ${error}`);
    }
};

const optimizeImages = async ({ dirName }) => {
    try {
        const timeTaken = "Time taken by processing images";
        console.time(timeTaken);
        const images = await getFiles({ dirName });
        const option = await getOptions();
        for (const image of images) {
            const timeTakenBySingleImage = "## Duration";
            console.time(timeTakenBySingleImage);
            await optimizeImage({ path: image, option });
            console.timeEnd(timeTakenBySingleImage);
        }
        console.timeEnd(timeTaken);
    } catch (error) {
        console.error(`Something went wrong while optimizing images: ${error}`);
    }
};

export { optimizeImages };
