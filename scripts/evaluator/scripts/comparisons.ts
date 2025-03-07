import fs from "fs";

import {
  readLines as readLinesBasic,
  writeLines,
} from "./helper/basic-readwrite";
import { readLines } from "./helper/large-readwrite";
import { range, max, sum } from "./helper/array-util";
import { createBar } from "./helper/bar";
import { randElem } from "./helper/random";

const nPrimeKnots = [
  1, 1, 2, 3, 7, 21, 49, 165, 552, 2176, 9988, 46972, 253293, 1388705,
];

let type = "b1";
if (process.argv.length >= 1 + 2) {
  type = process.argv[2];
}
const filename = `../../knot-${type}-3-16-vect.out`;
console.log(`(${type})`);

function countUnique(list: Array<string>) {
  const count: { [key: string]: Array<number> } = {};
  list.forEach((s, i) => {
    count[s] ??= [];
    count[s].push(i);
  });
  return count;
}

function randomPairs(list: Array<string>, reps: number, maxiter: number) {
  const firsts: Array<number> = [];
  const bar = createBar();
  bar.start(reps, 0);
  for (let i = 1; i <= reps; i++) {
    let count = 0;
    for (let j = 0; j < maxiter; j++) {
      if (randElem(list) == randElem(list)) {
        break;
      } else {
        count += 1;
      }
    }
    firsts.push(count);
    bar.increment();
  }
  bar.stop();
  return firsts;
}

// readLines(filename)
//   .then((lines) => {
//     console.log("Running unique");
//     const uniqueOutput: Array<string> = [];
//     for (let i = 0; i < nPrimeKnots.length; i++) {
//       // const start = sum(nPrimeKnots.slice(0, i));
//       // const end = sum(nPrimeKnots.slice(0, i + 1)) - 1;
//       // const partialStats = stats.slice(start, end + 1);
//       const end = sum(nPrimeKnots.slice(0, i + 1)) - 1;
//       const partialLines = lines.slice(0, end + 1);
//       const count = countUnique(partialLines);
//       // console.log(
//       //   i + 3,
//       //   `${(Object.keys(count).length * 100) / partialLines.length}%`,
//       //   Object.keys(count).length,
//       //   partialLines.length
//       // );
//       uniqueOutput.push(
//         `${i + 3},${(Object.keys(count).length * 100) / partialLines.length},${
//           Object.keys(count).length
//         },${partialLines.length}`
//       );
//     }
//     writeLines(`../../comparison/unique-${type}-3-16-vect.out`, uniqueOutput);

//     console.log("Running random");
//     for (let i = 0; i < nPrimeKnots.length; i++) {
//       // const start = sum(nPrimeKnots.slice(0, i));
//       // const end = sum(nPrimeKnots.slice(0, i + 1)) - 1;
//       // const partialStats = stats.slice(start, end + 1);
//       const end = sum(nPrimeKnots.slice(0, i + 1)) - 1;
//       const partialLines = lines.slice(0, end + 1);
//       // const randomOutput = randomPairs(partialLines, 100000, 1000000000);
//       const randomOutput = randomPairs(partialLines, 10000, 1000000000);
//       writeLines(
//         `../../comparison/random-pairs-${type}-${i + 3}.out`,
//         randomOutput.map((n) => String(n))
//       );
//     }
//   })
  Promise.resolve()
  .then(() => {
    console.log("Running random pairs stats");
    for (let i = 0; i < nPrimeKnots.length; i++) {
      const data = readLinesBasic(
        `../../comparison/random-pairs-${type}-${i + 3}.out`
      ).map(Number);
      console.log(i + 3, sum(data) / data.length);
    }
  });
