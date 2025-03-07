import fs from "fs";
import readline from "readline";

import { writeLines } from "./helper/basic-readwrite";
import {
  readLine,
  readLines,
  nLines,
  mapLines,
  mapLinesLarge,
} from "./helper/large-readwrite";
import { range, max, sum } from "./helper/array-util";
import { createBar } from "./helper/bar";

const nPrimeKnots = [
  1, 1, 2, 3, 7, 21, 49, 165, 552, 2176, 9988, 46972, 253293, 1388705,
];

const type = "b1";
// let n = 3;
// const args = process.argv.slice(1);
// if (args.length > 1) {
//   n = Number(args[1]);
// }
console.log(`(${type})`);

// // Roots around the axes
const toleranceX = 0.0001;
const toleranceY = toleranceX;
let countX = 0;
let countY = 0;
let countXY = 0;
Promise.all(
  // range(3, 16 + 1).map((n) =>
  range(15, 16 + 1).map((n) =>
    Promise.all(
      range(3, n + 1).map((i) =>
        mapLinesLarge(
          `../../_raw-data/roots/knot-${type}-${i}-roots.out`,
          (line) => {
            const [x, y] = line.trim().split(",").map(Number);
            if (
              y >= -toleranceY &&
              y <= toleranceY &&
              x >= -toleranceX &&
              x <= toleranceX
            ) {
              return 3;
            } else if (y >= -toleranceY && y <= toleranceY) {
              return 2;
            } else if (x >= -toleranceX && x <= toleranceX) {
              return 1;
            } else {
              return 0;
            }
          }
        )
      )
    )
      .then((res) => {
        const resflatish = res.map((o) => Object.values(o)).flat();
        countX = resflatish
          .map((r) => r.filter((n) => n === 1 || n === 3))
          .flat().length;
        countY = resflatish
          .map((r) => r.filter((n) => n === 2 || n === 3))
          .flat().length;
        countXY = resflatish
          .map((r) => r.filter((n) => n === 1 || n === 2 || n === 3))
          .flat().length;
        return sum(resflatish.map((r) => r.length));
      })
      .then((total) => [
        [countX, countY, countXY],
        [total],
        [
          (countX * 100) / total,
          (countY * 100) / total,
          (countXY * 100) / total,
        ],
      ])
  )
).then((res) => {
  res.forEach((stat, i) => {
    console.log("axes", i + 3, stat[2][2]);
    // console.log(
    //   "Roots around X,Y,XY axis: ",
    //   stat[0][0],
    //   stat[0][1],
    //   stat[0][2]
    // );
    // console.log("Total Roots:", stat[1][0]);
    // console.log(
    //   "% Roots around X,Y,XY axis: ",
    //   stat[2][0],
    //   stat[2][1],
    //   stat[2][2]
    // );
  });
});

// // // Roots around the unit circle
const toleranceCirc = 0.1;
let countCirc = 0;
Promise.all(
  // range(3, 16 + 1).map((n) =>
  range(15, 16 + 1).map((n) =>
    Promise.all(
      range(3, n + 1).map((i) =>
        mapLinesLarge(
          `../../_raw-data/roots/knot-${type}-${i}-roots.out`,
          (line) => {
            const [x, y] = line.trim().split(",").map(Number);
            return x * x + y * y >= 1 - toleranceCirc &&
              x * x + y * y <= 1 + toleranceCirc
              ? 1
              : 0;
          }
        )
      )
    )
      .then((res) => {
        const resflatish = res.map((o) => Object.values(o)).flat();
        countCirc = sum(resflatish.map((r) => sum(r)));
        return sum(resflatish.map((r) => r.length));
      })
      .then((total) => [countCirc, total, (countCirc * 100) / total])
  )
).then((res) => {
  res.forEach((stat, i) => {
    console.log("circle", i + 3, stat[2]);
    // console.log("Roots around unit circle:", stat[0]);
    // console.log("Total Roots:", stat[1]);
    // console.log("% Roots around unit circle:", stat[2]);
  });
});

// // Max abs of roots
Promise.all(
  // range(3, 16 + 1).map((n) =>
  range(15, 16 + 1).map((n) =>
    Promise.all(
      range(3, n + 1).map((i) =>
        mapLinesLarge(
          `../../_raw-data/roots/knot-${type}-${i}-roots.out`,
          (line) => {
            const [x, y] = line.trim().split(",").map(Number);
            return Math.sqrt(x * x + y * y);
          }
        )
      )
    ).then((res) => {
      const resflatish = res.map((o) => Object.values(o)).flat();
      return max(resflatish.map((r) => max(r)));
    })
  )
).then((res) => {
  res.forEach((n, i) => console.log("Max abs", i + 3, n));
});
