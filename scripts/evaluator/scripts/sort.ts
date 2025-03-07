import fs from "fs";

import { readLines, writeLines } from "./helper/basic-readwrite";
import { range, max, sum } from "./helper/array-util";
import { createBar } from "./helper/bar";

const nPrimeKnots = [
  1, 1, 2, 3, 7, 21, 49, 165, 552, 2176, 9988, 46972, 253293, 1388705,
];

const type = "a2";
const evaluated = readLines(`./data/knot-${type}-3-15-vect.out`);

// // Sum of abs coefficient
// const sums = evaluated.map((v) =>
//   sum(v.split(",").map((n) => Math.abs(Number(n))))
// );

// const sortedSums = sums.map((n, i) => [i, n]).toSorted((a, b) => a[1] - b[1]);
// // console.log(sorted.slice(0, 10));

// writeLines(
//   `./data/sort-sum-${type}-3-15.out`,
//   sortedSums.map(([i, n]) => `${i},${n}`)
// );

// // Max of abs coefficient
// const maxs = evaluated.map((v) =>
//   Math.max(...v.split(",").map((n) => Math.abs(Number(n))))
// );

// const sortedMaxs = maxs.map((n, i) => [i, n]).toSorted((a, b) => a[1] - b[1]);
// // console.log(sorted.slice(0, 10));

// writeLines(
//   `./data/sort-max-${type}-3-15.out`,
//   sortedMaxs.map(([i, n]) => `${i},${n}`)
// );

////////////////////////////////////////////////////////////////////////////////////
// only n crossing knots
const n = 15;

// // Sum of abs coefficient
const sums = evaluated
  .map((v) => sum(v.split(",").map((n) => Math.abs(Number(n)))))
  .map((n, i) => [i, n])
  .filter(
    (_, i) =>
      i >= sum(nPrimeKnots.slice(0, n - 3)) &&
      i < sum(nPrimeKnots.slice(0, n + 1 - 3))
  );
const sortedSums = sums.toSorted((a, b) => a[1] - b[1]);
// console.log(sorted.slice(0, 10));

writeLines(
  `./data/sort-sum-${type}-15.out`,
  sortedSums.map(([i, n]) => `${i},${n}`)
);

// // Max of abs coefficient
const maxs = evaluated
  .map((v) => Math.max(...v.split(",").map((n) => Math.abs(Number(n)))))
  .map((n, i) => [i, n])
  .filter(
    (_, i) =>
      i >= sum(nPrimeKnots.slice(0, n - 3)) &&
      i < sum(nPrimeKnots.slice(0, n + 1 - 3))
  );
const sortedMaxs = maxs.toSorted((a, b) => a[1] - b[1]);
// console.log(sorted.slice(0, 10));

writeLines(
  `./data/sort-max-${type}-15.out`,
  sortedMaxs.map(([i, n]) => `${i},${n}`)
);
