import fs from "fs";

import { readLines, writeLines } from "./helper/basic-readwrite";
import { readLine, mapLines } from "./helper/large-readwrite";
import { range, max, sum } from "./helper/array-util";
import { createBar } from "./helper/bar";

const nPrimeKnots = [
  1, 1, 2, 3, 7, 21, 49, 165, 552, 2176, 9988, 46972, 253293, 1388705,
];

const type = "b1";
const filename = `../../knot-${type}-3-16-vect.out`;

// // Max of abs coefficient
mapLines(filename, (line) =>
  Math.max(...line.split(",").map((n) => Math.abs(Number(n))))
).then((res) => {
  writeLines(
    `../../stat/stat-maxAbs-${type}-3-16.out`,
    res.map((n) => `${n}`)
  );
});

// // Sum of abs coefficient
mapLines(filename, (line) =>
  sum(line.split(",").map((n) => Math.abs(Number(n))))
).then((res) => {
  writeLines(
    `../../stat/stat-sumAbs-${type}-3-16.out`,
    res.map((n) => `${n}`)
  );
});

// // Avg of abs coefficient
const getSpan = <T>(arr: Array<T>, symbol: T) => {
  if (arr.filter((a) => a !== symbol).length === 0) {
    return 0;
  }
  let left: number = 0,
    right: number = 0;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== symbol) {
      left = i;
      break;
    }
  }
  for (let i = 0; i < arr.length; i++) {
    if (arr[arr.length - 1 - i] !== symbol) {
      right = i;
      break;
    }
  }
  return arr.length - left - right;
};
mapLines(filename, (line) => getSpan(line.split(","), "0")).then((res) => {
  writeLines(
    `../../stat/stat-spread-${type}-3-16.out`,
    res.map((n) => `${n}`)
  );
});

// // Avg of abs coefficient
mapLines(
  filename,
  (line) =>
    sum(line.split(",").map((n) => Math.abs(Number(n)))) /
    getSpan(line.split(","), "0")
).then((res) => {
  writeLines(
    `../../stat/stat-avgAbs-${type}-3-16.out`,
    res.map((n) => `${n}`)
  );
});
