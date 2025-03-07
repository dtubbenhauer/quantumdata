import fs from "fs";

import { readLines, writeLines } from "./helper/basic-readwrite";
import { range, max, sum } from "./helper/array-util";
import { createBar } from "./helper/bar";

function nonEmpty(
  filename: (start: number, incr: number) => string,
  start: number,
  end: number,
  incr: number
) {
  for (let i = start; i < end; i += incr) {
    try {
      const lines = readLines(filename(i, i + incr - 1));
      if (lines.length !== incr) {
        console.log(`${i} ${i + incr - 1} ${lines.length}`);
      }
    } catch (e) {
      // console.error(e);
      console.log(`${i} ${i + incr - 1} 0`);
    }
  }
}

function missingIndicies(
  filename: (start: number, incr: number) => string,
  start: number,
  end: number,
  incr: number,
  outprefix: string = "js"
) {
  console.log("Parsing partial B1");
  const missing: Array<number> = [];

  const bar = createBar();
  bar.start(Math.ceil((end - start) / incr), 0);
  for (let i = start; i < end; i += incr) {
    try {
      const lines = readLines(filename(i, i + incr - 1));
      missing.push(...range(incr - lines.length, i + lines.length));
    } catch (e) {
      // console.error(e);
      console.log(`${filename(i, i + incr - 1)} not found`);
      missing.push(...range(incr, i));
    }
    bar.increment();
  }
  bar.stop();

  console.log("Writing files");
  fs.writeFileSync(
    `data/15-pieces-partial/${outprefix}-missing-indices.out`,
    `${missing.join("\n")}\n`
  );
}

// missingIndicies(
//   (start, end) =>
//     `data/15-pieces-partial/v2/js/knot-i-${start}-${end}-dict.new.out`,
//   59937,
//   59937 + 253293 - 1,
//   10,
//   "js"
// );
// nonEmpty(
//   (start, end) =>
//     `data/15-pieces-partial/v2/js/knot-i-${start}-${end}-dict.new.out`,
//   59937,
//   59937 + 253293 - 1,
//   10
// );

// missingIndicies(
//   (start, end) =>
//     `data/15-pieces-partial/v2/wolfram/knot-b1-${start}-${end}-json.new.out`,
//   59937,
//   59937 + 253293 - 1,
//   100,
//   "wolfram"
// );
nonEmpty(
  (start, end) =>
    `data/15-pieces-partial/v2/wolfram/knot-b1-${start}-${end}-json.new.out`,
  59937,
  59937 + 253293 - 1,
  100
);
