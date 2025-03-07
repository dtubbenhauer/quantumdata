import fs from "fs";

import { appendLines, readLines, writeLines } from "./helper/basic-readwrite";
import { range, max, sum } from "./helper/array-util";
import { createBar } from "./helper/bar";

import {
  karatsuba,
  normalise,
  Poly,
  polyToPolyBase,
  rescaleQ,
} from "../modules/evaluate-poly";

// // Merge B1 (Partial)
type Data = {
  p: string;
  type: "batch" | "single";
};
const folder = `D:/tmp/02partial`;

// // // Sort singles into buckets (makes some stuff later faster)
// ["wolfram", "js"].forEach((name) => {
//   console.log(`(${name})`);
//   const files = fs
//     .readdirSync(`${folder}/${name}-single`)
//     .filter((s) => s.startsWith("knot-") && !s.includes("/"));
//   const bar = createBar();
//   bar.start(files.length, 0);
//   files.map((filename) => {
//     const bucket =
//       Number(filename.split("-")[2]) - (Number(filename.split("-")[2]) % 10000);
//     if (!fs.existsSync(`${folder}/${name}-single/${bucket}`)) {
//       fs.mkdirSync(`${folder}/${name}-single/${bucket}`);
//     }
//     fs.renameSync(
//       `${folder}/${name}-single/${filename}`,
//       `${folder}/${name}-single/${bucket}/${filename}`
//     );
//     bar.increment();
//   });
//   bar.stop();
// });

const b1Js: { [index: string]: Data } = {};
const b1Wolfram: { [index: string]: Data } = {};
const start = 313230;
const end = 1701934;

// (batch)
console.log("---------- Batch ----------");
const incrBatch = 100;
[
  {
    name: "wolfram",
    dict: b1Wolfram,
    prefix: "knot-b1-",
    suffix: "-json.new.out",
    startAlt: (start: number, end: number) => start,
  },
  {
    name: "js",
    dict: b1Js,
    prefix: "knot-i-",
    suffix: "-dict.new.out",
    startAlt: (start: number, end: number) => {
      const filenames = fs
        .readdirSync(`${folder}/js-batch`)
        .filter((fn) => fn.endsWith(`-${end}-dict.new.out`));
      if (filenames.length > 1) {
        // notify potential errors
        console.log(filenames.length, start, end);
      }
      return Number(filenames[0].split("-")[2]);
    },
  },
].forEach((d) => {
  let countBatch = 0;
  console.log(`(${d.name})`);
  const bar = createBar();
  bar.start(Math.ceil((end - start + 1) / incrBatch), 0);
  for (let i = start; i <= end; i += incrBatch) {
    bar.increment();
    try {
      const endTemp = i + incrBatch - 1;
      const endReal = end < endTemp ? end : endTemp;
      const startReal = d.startAlt(i, endReal);
      const batch = readLines(
        `${folder}/${d.name}-batch/${d.prefix}${startReal}-${endReal}${d.suffix}`
      );
      if (batch.length === 0) {
        continue;
      }
      batch.forEach((line, j) => {
        if (d.dict[String(startReal + j)] !== undefined) {
          console.log(`Overwriting ${startReal + j}`)
        }
        d.dict[String(startReal + j)] = {
          p: line,
          type: "batch",
        };
      });
      countBatch++;
    } catch {
      // console.log(`Batch (W) not found: ${i}-${i + incrBatch - 1}`);
    }
  }
  bar.stop();
  console.log(
    `Processed ${countBatch} batches, ${Object.keys(d.dict).length} lines`
  );
});

// (single)
console.log("---------- Single ----------");
[
  {
    name: "wolfram",
    dict: b1Wolfram,
    prefix: "knot-b1-",
    suffix: "-json.new.out",
  },
  {
    name: "js",
    dict: b1Js,
    prefix: "knot-b1-",
    suffix: "-dict.new.out",
  },
].forEach((d) => {
  let count = 0;
  console.log(`(${d.name})`);
  const bar = createBar();
  bar.start(end - start + 1, 0);
  for (let i = start; i <= end; i++) {
    bar.increment();
    try {
      const lines = readLines(
        `${folder}/${d.name}-single/${i - (i % 10000)}/${d.prefix}${i}-${i}${
          d.suffix
        }`
      );
      if (lines.length !== 1) {
        console.log(`Not just one line at ${i}`);
      }
      lines.forEach((line, j) => {
        if (d.dict[String(i + j)] !== undefined) {
          console.log(`Overwriting ${i + j}`);
        }
        d.dict[String(i + j)] = {
          p: line,
          type: "single",
        };
      });
      count++;
    } catch {
      // console.log(`Batch (W) not found: ${i}-${i + incrBatch - 1}`);
    }
  }
  bar.stop();
  console.log(`Processed ${count} singles`);
});

// // Wolfram failing some
// console.log(
//   Object.keys(b1Wolfram).filter((k) => {
//     return b1Wolfram[k].p.startsWith("StringDele");
//   })
// );

// (merge)
console.log("---------- Merging ----------");
const writhes = readLines("../../colours/writhe-3-16.txt").map(Number);

const output: Array<string> = [];
const outputLog: Array<string> = [];
const bar = createBar();
bar.start(end, start-1);
for (let i = start; i <= end; i++) {
  const key = String(i);
  const log = [];
  let poly = "";
  if (b1Js[key] !== undefined) {
    log.push(`j${b1Js[key].type[0]}`);
    poly = b1Js[key].p;
  } else {
    log.push(`__`);
  }
  if (b1Wolfram[key] !== undefined) {
    log.push(`w${b1Wolfram[key].type[0]}`);
    const writhe = writhes[i];
    const scaling: Poly = [
      0,
      {
        // (q^-2 + 1 + q^2) * q^(-4*writhe())
        [String(-2 - 4 * writhe)]: 1,
        [String(-4 * writhe)]: 1,
        [String(2 - 4 * writhe)]: 1,
      },
    ];
    const polyW = JSON.stringify(
      polyToPolyBase(
        karatsuba(scaling, [0, rescaleQ(JSON.parse(b1Wolfram[key].p), 2)])
      )
    );
    if (poly.length === 0) {
      poly = polyW;
    } else if (poly !== polyW) {
      console.log(`${i}, no match`);
    }
  } else {
    log.push(`__`);
  }
  output.push(poly);
  outputLog.push(log.join(""));
  bar.increment();
}
bar.stop();
output.forEach((line) => {
  appendLines(`${folder}/knot-b1-partial16-dict.out`, [`${line}\n`]);
});
outputLog.forEach((line) => {
  appendLines(`${folder}/knot-b1-partial16-mergelog.out`, [`${line}\n`]);
});
