import fs from "fs";

import {
  readLines as readLinesBasic,
  writeLines,
} from "./helper/basic-readwrite";
import { range, max, sum } from "./helper/array-util";

import { createBar } from "./helper/bar";

const lines = readLinesBasic("../wolfram/data/PD_3-16_clean.txt");
// const bar = createBar();
// bar.start(lines.length - 1, 0);
// lines.forEach((line, i) => {
//   writeLines(`../wolfram/data/${i - (i % 100000)}/pd-${i}.txt`, [line]);
//   bar.increment();
// });
// bar.stop();

// // Just the end - give to another program
// writeLines(
//   `../wolfram/data/pd-from${1295365}.txt`,
//   lines.slice(1295365)
// );

// // Check files
// const bar = createBar();
// bar.start(lines.length - 1, 0);
// for (let i = 0; i <= 1701934; i++) {
//   if (
//     lines[i] !==
//     readLinesBasic(`../wolfram/data/${i - (i % 100000)}/pd-${i}.txt`)[0]
//   ) {
//     console.log(i);
//   }
//   bar.increment();
// }
// bar.stop();

// // Get knot at index
const i = 1128904;
console.log(lines[i]);
