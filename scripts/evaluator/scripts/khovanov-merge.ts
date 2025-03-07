import fs from "fs";
import readline from "readline";
import cliProgress from "cli-progress";

import { readLines, writeLines } from "./helper/basic-readwrite";
import { range, max, sum } from "./helper/array-util";

function getAll(
  filename: (start: number, incr: number) => string,
  start: number,
  end: number,
  incr: number
) {
  const ret: Array<string> = [];
  for (let i = start; i < end; i += incr) {
    try {
      const lines = readLines(filename(i, i + incr - 1));
      if (lines.length !== incr) {
        console.log(`${i} ${i + incr - 1} ${lines.length}`);
      }
      ret.push(...lines);
    } catch (e) {
      // console.error(e);
      console.log(`${i} ${i + incr - 1} 0`);
    }
  }
  return ret;
}

// const all = getAll(
//   (start, end) =>
//     `../../../../knot-invariant-data/_raw-data/16-pieces/knot-khovanov-${start}-${end}-poly.new.out`,
//   313230,
//   1701934,
//   70000
// );

const all = getAll(
  (start, end) =>
    `16-pieces\\knot-khovanov-${start}-${
      end <= 1701934 ? end : 1701934
    }-poly.new.out`,
  313230,
  1701934,
  70000
);

console.log(all.length);
writeLines("data/khovanov-polynomials-16.txt", all);
