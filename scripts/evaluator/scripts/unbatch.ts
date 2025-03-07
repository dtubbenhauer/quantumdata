import fs from "fs";

import { readLines, writeLines } from "./helper/basic-readwrite";
import { range, max, sum } from "./helper/array-util";

const batches = readLines("data/batches").map((line) =>
  line.split(" ").map(Number)
);

// Sanity check, the sizes should be < 100
console.log(
  "CHECK overflow:",
  batches.every((b) => b[1] <= 100) ? "OK" : "Fail"
);

// // Unbatch into a list of all indices
const singles: Array<number> = [];
batches.forEach((b) => singles.push(...range(b[0] + b[1], b[2] + 1)));
writeLines("data/unfinished-indices.out", singles.map(String));
