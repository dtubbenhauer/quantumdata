import fs from "fs";
import readline from "readline";

import { evaluateKnot, pdDictToGraph } from "./modules/knots/evaluate-q-knot";
import { readKnot } from "./modules/knots/process-knot-file";

import { createBar } from "./scripts/helper/bar";
import { performance } from "perf_hooks";

import {
  isConst,
  karatsuba,
  dumbAdd,
  coeffToPoly,
  coeffsToPoly,
  readCoeff,
  collectCoeff,
  polyToPolyBase,
  coeffsToPolyMemoize,
  polySum,
  polyEq,
} from "./modules/evaluate-poly";

const nPrimeKnots = [
  1, 1, 2, 3, 7, 21, 49, 165, 552, 2176, 9988, 46972, 253293, 1388705,
];

const mem = {};
async function runKnotsB1(
  starti: number,
  endi = starti,
  outName = `data/knot-b1-${starti}-${endi}-dict.new.out`,
  timeOutName = `data/knot-b1-${starti}-${endi}-time.new.out`
) {
  console.log(`starti=${starti}, endi=${endi}`);
  const bar1 = createBar();
  bar1.start(endi - starti + 1, 0);
  for (let i = starti; i <= endi; i++) {
    await readKnot(i).then((knotdata) => {
      const k = knotdata.crossings;
      const startTime = performance.now();
      const res = polyToPolyBase(
        polySum(
          collectCoeff(evaluateKnot(k)).map(([c, p]) =>
            karatsuba(p, coeffsToPolyMemoize([c], mem))
          )
        )
      );
      const endTime = performance.now();

      // Individual files
      outName = `data/knot-b1-${i}-${i}-dict.new.out`;
      timeOutName = `data/knot-b1-${i}-${i}-time.new.out`;

      fs.appendFileSync(outName, `${JSON.stringify(res)}\n`);
      fs.appendFileSync(timeOutName, `${(endTime - startTime) / 1000}\n`);
    });
    bar1.increment();
  }
  bar1.stop();
}

// Process command line arguments
const args = process.argv.slice(2);
if (args.length >= 2) {
  const starti = Number(args[0]);
  const endi = Number(args[1]);
  if (isNaN(starti) || isNaN(endi) || starti > endi) {
    process.exit(1); // error, they are not numbers
  }

  runKnotsB1(starti, endi);
}
