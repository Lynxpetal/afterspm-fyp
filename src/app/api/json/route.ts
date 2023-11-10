import { NextResponse } from "next/server";
import fsPromises from "fs/promises";
import path from "path";

interface jsonRequest {
    jsonFile: string
    key: any
    value: any
  }

export async function POST(request: jsonRequest) {
    const { jsonFile, key, value } = await request.json();

    // Error Conditions
    if (jsonFile == undefined || jsonFile == null) {
        return new NextResponse(
            JSON.stringify({ status: 500, message: "Missing jsonFile parameter. " })
        );
    }
    // Fetch All JSON Data
    else if (key == null && value == null) {
        const dataFilePath = path.join(process.cwd(), "json", jsonFile);
        try {
            const jsonData = await fsPromises.readFile(dataFilePath);
            return new NextResponse(JSON.stringify({ status: 200, message: JSON.parse(jsonData) }));
        } catch {
            return new NextResponse(
                JSON.stringify({ status: 500, message: "Invalid JSON Filename. " })
            );
        }
    }

    // Error conditions
    else if (key == null && value != null) {
        return new NextResponse(JSON.stringify({ status: 500, message: "Missing key. " }));
    } else if (key != null && value == null) {
        return new NextResponse(JSON.stringify({ status: 500, message: "Missing value. " }));
    }
    // Fetch one record by key: value pair
    else {
        const dataFilePath = path.join(process.cwd(), "json", jsonFile);
        try {
            const jsonData = await fsPromises.readFile(dataFilePath);
            const filteredData = (await JSON.parse(jsonData)).filter((each) => {
                return each[key] == value;
            });
            return new NextResponse(
                JSON.stringify({ status: 200, message: JSON.parse(filteredData) })
            );
        } catch {
            return new NextResponse(
                JSON.stringify({ status: 500, message: "Invalid JSON Filename. " })
            );
        }
    }
}
