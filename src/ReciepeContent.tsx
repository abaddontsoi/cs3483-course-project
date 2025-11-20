"use server";

export interface IReciepe {
    title: string;
    image: string;
    servings?: string;
    time?: string;
    ingredients: string[];
    steps: string[];
}

import path from "path";
import fs from "fs";


export const getReciepe = async (): Promise<IReciepe[]> => {
    const reciepeDirectory = path.join(process.cwd(), "src/reciepes");
    const fileNames = fs.readdirSync(reciepeDirectory);
    const reciepeList = fileNames.map((fileName) => {
        const fullPath = path.join(reciepeDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const reciepeData = JSON.parse(fileContents) as IReciepe;
        return reciepeData;
    });
    return reciepeList;
}