import fs from "fs";

import { readLines, writeLines } from "./helper/basic-readwrite";
import { readLine, mapLines } from "./helper/large-readwrite";
import { range, max, sum } from "./helper/array-util";
import { createBar } from "./helper/bar";

const nPrimeKnots = [
  1, 1, 2, 3, 7, 21, 49, 165, 552, 2176, 9988, 46972, 253293, 1388705,
];

const type = "b1";
const statType = ["maxAbs", "sumAbs", "span", "avgAbs"][2];
console.log(`(${type}, ${statType})`);

const stats = readLines(`../../stat/stat-${statType}-${type}-3-16.out`).map(
  Number
);

console.log("Max:");
for (let i = 0; i < nPrimeKnots.length; i++) {
  // const start = sum(nPrimeKnots.slice(0, i));
  // const end = sum(nPrimeKnots.slice(0, i + 1)) - 1;
  // const partialStats = stats.slice(start, end + 1);

  const end = sum(nPrimeKnots.slice(0, i + 1)) - 1;
  const partialStats = stats.slice(0, end + 1);

  console.log(i + 3, max(partialStats));
}

console.log("Avg:");
for (let i = 0; i < nPrimeKnots.length; i++) {
  // const start = sum(nPrimeKnots.slice(0, i));
  // const end = sum(nPrimeKnots.slice(0, i + 1)) - 1;
  // const partialStats = stats.slice(start, end + 1);

  const end = sum(nPrimeKnots.slice(0, i + 1)) - 1;
  const partialStats = stats.slice(0, end + 1);

  console.log(i + 3, sum(partialStats) / (end + 1));
}
