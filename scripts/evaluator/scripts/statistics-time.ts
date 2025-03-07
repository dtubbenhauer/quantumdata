import fs from "fs";

import {
  readLines as readLinesBasic,
  writeLines,
} from "./helper/basic-readwrite";
import { mapLines } from "./helper/large-readwrite";
import { range, max, sum, min } from "./helper/array-util";
import { createBar } from "./helper/bar";

const nPrimeKnots = [
  1, 1, 2, 3, 7, 21, 49, 165, 552, 2176, 9988, 46972, 253293, 1388705,
];

let nPrimeKnotsCumulative = [
  1, 2, 4, 7, 14, 35, 84, 249, 801, 2977, 12965, 59937, 313230, 1701935,
];

let type = "a2";
if (process.argv.length >= 1 + 2) {
  type = process.argv[2];
}
console.log(`(${type})`);

const filename = `../../time/knot-${type}-3-14-time-wolfram.out`;
// const filename = `../../time/knot-b1-3-14-time-js.out`;
const times = readLinesBasic(filename).map(Number);

// Sample mean
console.log("Sample mean:");
nPrimeKnotsCumulative.slice(0, 14 - 3 + 1).forEach((n, i) => {
  const timesPartial = times.slice(0, n + 1);
  const mean = sum(timesPartial) / timesPartial.length;
  // timesPartial.forEach((t,i) => isNaN(t) && console.log(i))
  console.log(i + 3, mean);
});

// Sample standard deviation and variance
console.log("Sample SD = sqrt(Var):");
nPrimeKnotsCumulative.slice(0, 14 - 3 + 1).forEach((n, i) => {
  const timesPartial = times.slice(0, n + 1);
  const mean = sum(timesPartial) / timesPartial.length;
  const variance =
    (1 / (timesPartial.length - 1)) *
    sum(timesPartial.map((t) => (t - mean) * (t - mean)));
  const standardDeviation = Math.sqrt(variance);
  console.log(i + 3, `${standardDeviation} = sqrt(${variance})`);
});

// Median
console.log("Median:");
nPrimeKnotsCumulative.slice(0, 14 - 3 + 1).forEach((n, i) => {
  const timesPartial = times.slice(0, n + 1);
  const sorted = timesPartial.toSorted((a, b) => a - b);
  const half = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
  console.log(i + 3, median);
});

// Range
console.log("Range:");
nPrimeKnotsCumulative.slice(0, 14 - 3 + 1).forEach((n, i) => {
  const timesPartial = times.slice(0, n + 1);
  const rangeMax = max(timesPartial);
  const rangeMin = min(timesPartial);
  console.log(i + 3, rangeMin, rangeMax);
});
