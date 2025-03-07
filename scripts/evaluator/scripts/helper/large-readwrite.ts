import fs from "fs";
import readline from "readline";

import { createBar } from "./bar";

// https://stackoverflow.com/questions/45556535/nodejs-readline-only-read-the-first-2-lines
export async function readLine(filename: string, linenumber: number) {
  const linereader = readline.createInterface(fs.createReadStream(filename));
  let lineCounter = 0;
  for await (const line of linereader) {
    if (lineCounter === linenumber) {
      return line;
    } else {
      lineCounter++;
    }
  }
}

// slow beacuse we're reading the whole file
// but doesn't use much memory
export async function nLines(filename: string) {
  const linereader = readline.createInterface(fs.createReadStream(filename));
  let lineNumber = 0;
  for await (const line of linereader) {
    lineNumber++;
  }
  return lineNumber;
}

// reads the whole file into an array
export async function readLines(filename: string, nlines: number = 0) {
  const bar = createBar();
  bar.start(nlines, 0);

  const ret: Array<string> = [];
  const linereader = readline.createInterface(fs.createReadStream(filename));
  for await (const line of linereader) {
    ret.push(line.trimEnd());
    bar.increment();
  }
  bar.stop();
  return ret;
}

export async function mapLines<T>(
  filename: string,
  f: (line: string) => T,
  nlines: number = 0
): Promise<Array<T>> {
  const bar = createBar();
  bar.start(nlines, 0);

  const linereader = readline.createInterface(fs.createReadStream(filename));
  const ret: Array<T> = [];
  for await (const line of linereader) {
    ret.push(f(line));
    bar.increment();
  }
  bar.stop();
  return ret;
}

export async function mapLinesLarge<T>(
  filename: string,
  f: (line: string) => T,
  nlines: number = 0,
  groupSize: number = 1000000
): Promise<{ [mod10: number]: Array<T> }> {
  const bar = createBar();
  bar.start(nlines, 0);

  const linereader = readline.createInterface(fs.createReadStream(filename));
  const ret: { [group: number]: Array<T> } = {};
  let count = 0;
  for await (const line of linereader) {
    ret[count - count % groupSize] ??= [];
    ret[count - count % groupSize].push(f(line));
    bar.increment();
    count++;
  }
  bar.stop();
  return ret;
}
