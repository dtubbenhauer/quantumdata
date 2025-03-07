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

const all = ["a2", "alexander", "b1", "jones", "khovanov", "khovanov-t1"];
/*
(All possible combinations, *=involves b1)

01
02*
03
04
05
12*
13
14
15
23*
24
25
35
012*
013
014
015
023*
024*
025*
035
123*
124*
125*
135
235*

*/
// const toCombine = [3, 5].map((i) => all[i]);
const toCombine = [0, 1, 2, 4].map((i) => all[i]); // all
console.log(`(${toCombine.join("+")})`);

Promise.all(
  toCombine.map((type) => readLines(`../../knot-${type}-3-16-vect.out`))
)
  .then((liness) =>
    range(0, liness[0].length + 1).map((i) =>
      liness.map((lines) => lines[i]).join(",,")
    )
  )
  .then((lines) => {
    console.log("Running unique");
    const uniqueOutput: Array<string> = [];
    for (let i = 0; i < nPrimeKnots.length; i++) {
      // const start = sum(nPrimeKnots.slice(0, i));
      // const end = sum(nPrimeKnots.slice(0, i + 1)) - 1;
      // const partialStats = stats.slice(start, end + 1);
      const end = sum(nPrimeKnots.slice(0, i + 1)) - 1;
      const partialLines = lines.slice(0, end + 1);
      const count = countUnique(partialLines);
      // console.log(
      //   i + 3,
      //   `${(Object.keys(count).length * 100) / partialLines.length}%`,
      //   Object.keys(count).length,
      //   partialLines.length
      // );
      uniqueOutput.push(
        `${i + 3},${(Object.keys(count).length * 100) / partialLines.length},${
          Object.keys(count).length
        },${partialLines.length}`
      );
    }
    writeLines(
      `../../comparison/unique-${toCombine.join("+")}-3-16-vect.out`,
      uniqueOutput
    );

    console.log("Running random");
    for (let i = 0; i < nPrimeKnots.length; i++) {
      // const start = sum(nPrimeKnots.slice(0, i));
      // const end = sum(nPrimeKnots.slice(0, i + 1)) - 1;
      // const partialStats = stats.slice(start, end + 1);
      const end = sum(nPrimeKnots.slice(0, i + 1)) - 1;
      const partialLines = lines.slice(0, end + 1);
      const randomOutput = randomPairs(partialLines, 10000, 1000000000);
      writeLines(
        `../../comparison/random-pairs-${toCombine.join("+")}-${i + 3}.out`,
        randomOutput.map((n) => String(n))
      );
    }
  })
  // Promise.resolve()
  .then(() => {
    // Random pairs stats
    console.log("Running random pairs stats");
    for (let i = 0; i < nPrimeKnots.length; i++) {
      const data = readLinesBasic(
        `../../comparison/random-pairs-${toCombine.join("+")}-${i + 3}.out`
      ).map(Number);
      console.log(i + 3, sum(data) / data.length);
    }
  });
