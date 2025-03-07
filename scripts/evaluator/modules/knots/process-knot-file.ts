import fs from "fs";
import readline from "readline";

import type { Crossing } from "./evaluate-q-knot";

export function readKnot(
  i: number,
  filename = "data/PD_3-16.txt"
): Promise<{ i: number; name: string; crossings: Crossing[] }> {
  return new Promise((resolve, reject) => {
    // from https://nodejs.org/api/readline.html#example-read-file-stream-line-by-line
    // from https://stackoverflow.com/questions/28747719/what-is-the-most-efficient-way-to-read-only-the-first-line-of-a-file-in-node-js
    const fileStream = fs.createReadStream(filename);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    let curLine = 0;
    let output: string;
    rl.on("line", (line) => {
      if (curLine === i) {
        output = line;
        rl.close();
      }
      curLine++;
    })
      .on("close", () => {
        const rgx = /\[(\d+),'(.+)',(.+)\]/.exec(output);
        if (rgx === null) reject("readKnot error: Regex failed");
        resolve({
          i: Number(rgx?.[1]),
          name: rgx?.[2] as string,
          crossings: JSON.parse(rgx?.[3] as string),
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
