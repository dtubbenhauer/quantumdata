import fs from "fs";
import readline from "readline";

import { readLines, writeLines } from "./helper/basic-readwrite";
import { readLine, mapLines, mapLinesLarge } from "./helper/large-readwrite";
import { range, zeros2, max, sum } from "./helper/array-util";
import { createBar } from "./helper/bar";

const nPrimeKnots = [
  1, 1, 2, 3, 7, 21, 49, 165, 552, 2176, 9988, 46972, 253293, 1388705,
];

type GridSparse = { [index: string]: number };
type GridSparseData = {
  width: number;
  height: number;
  circleCentre: [number, number];
  circleRadius: number;
  gridSparse: GridSparse;
};
async function rootsToGridSparse(
  filename: string,
  width: number = 100,
  height: number = 100,
  minX: number = -5,
  maxX: number = 5,
  minY: number = -5,
  maxY: number = 5
): Promise<GridSparseData> {
  const xToIx = (x: number) =>
    Math.floor(((x - minX) / (maxX - minX)) * (width - 1));
  const yToIy = (y: number) =>
    Math.floor(((y - minY) / (maxY - minY)) * (height - 1));
  const bar = createBar();
  bar.start(0, 1);

  const linereader = readline.createInterface(fs.createReadStream(filename));
  const grid: GridSparse = {};
  for await (const line of linereader) {
    const p = line.split(",").map(Number);
    const x = p[0];
    const y = p[1];
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      const ix = xToIx(x);
      const iy = yToIy(y);
      grid[`${ix},${iy}`] ??= 0;
      grid[`${ix},${iy}`] += 1;
    }
    bar.increment();
  }
  bar.stop();
  return {
    width,
    height,
    circleCentre: [xToIx(0), yToIy(0)],
    circleRadius: xToIx(1) - xToIx(0),
    gridSparse: grid,
  };
}

const type = "b1";
let n = 16;
const args = process.argv.slice(1);
if (args.length > 1) {
  n = Number(args[1]);
}
console.log(`(${type}, n = ${n})`);

const width = 1000;
const height = 1000;

// // Full picture
// Promise.all(
//   range(3, n + 1).map((i) =>
//     mapLinesLarge(
//       `../../_raw-data/roots/knot-${type}-${i}-roots.out`,
//       (line) => {
//         const [x, y] = line.trim().split(",").map(Number);
//         return x * x + y * y;
//       }
//     )
//   )
// )
//   .then((maxss) =>
//     Math.sqrt(
//       max(
//         maxss
//           .map((r) => Object.values(r))
//           .flat()
//           .map((r) => max(r))
//       )
//     )
//   )
Promise.resolve(3.7987 + 0.0001) // from previous calculations
  .then((maxsize) =>
    Promise.all(
      range(3, n + 1).map((i) =>
        rootsToGridSparse(
          `../../_raw-data/roots/knot-${type}-${i}-roots.out`,
          width,
          height,
          -maxsize,
          maxsize,
          -maxsize,
          maxsize
        )
      )
    )
  )
  .then((grids) => {
    const result: GridSparseData = {
      width,
      height,
      circleCentre: grids[grids.length - 1].circleCentre,
      circleRadius: grids[grids.length - 1].circleRadius,
      gridSparse: {},
    };
    grids.forEach((grid) => {
      Object.keys(grid.gridSparse).forEach((key) => {
        result.gridSparse[key] ??= 0;
        result.gridSparse[key] += grid.gridSparse[key];
      });
    });
    writeLines(
      `../../_raw-data/roots/knot-${type}-3-${n}-rootsgridsparse-1000x1000-full.out`,
      [JSON.stringify(result)]
    );
  });

// // Zoomed picture
Promise.all(
  range(3, n + 1).map((i) =>
    rootsToGridSparse(
      `../../_raw-data/roots/knot-${type}-${i}-roots.out`,
      width,
      height,
      -2,
      2,
      -2,
      2
    )
  )
).then((grids) => {
  const result: GridSparseData = {
    width,
    height,
    circleCentre: grids[grids.length - 1].circleCentre,
    circleRadius: grids[grids.length - 1].circleRadius,
    gridSparse: {},
  };
  grids.forEach((grid) => {
    Object.keys(grid.gridSparse).forEach((key) => {
      result.gridSparse[key] ??= 0;
      result.gridSparse[key] += grid.gridSparse[key];
    });
  });
  writeLines(
    `../../_raw-data/roots/knot-${type}-3-${n}-rootsgridsparse-1000x1000-near.out`,
    [JSON.stringify(result)]
  );
});
