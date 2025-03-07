import fs from "fs";

import { readLines, writeLines } from "./helper/basic-readwrite";
import { range, max, sum } from "./helper/array-util";
import { createBar } from "./helper/bar";

function subst1(dict: { [powers: string]: number }): {
  [power: string]: number;
} {
  const ret: { [power: string]: number } = {};
  Object.keys(dict).forEach((k) => {
    const [xDeg, _] = k.split(",").map(Number);
    ret[xDeg] = (ret[xDeg] ?? 0) + dict[k];
  });
  return ret;
}

// const dicts = [
//   ...readLines("../../knot-khovanov-3-10-dict.out"),
//   ...readLines("../../knot-khovanov-11-dict.out"),
//   ...readLines("../../knot-khovanov-12-dict.out"),
//   ...readLines("../../knot-khovanov-13-dict.out"),
//   ...readLines("../../knot-khovanov-14-dict.out"),
//   ...readLines("../../knot-khovanov-15-dict.out"),
//   ...readLines("../../knot-khovanov-16-dict.out"),
// ].map((line) => JSON.parse(line));
// console.log(dicts.length);

// ================ Dictionary at t=1 ================
// const dicts2 = dicts.map((d) => subst1(d));

// console.log("Writing dict file");
// bar.start(dicts2.length, 1);
// for (let i = 0; i < dicts2.length; i++) {
//   fs.appendFileSync(
//     "data/knot-khovanov-t1-3-16-dict.out",
//     `${JSON.stringify(dicts2[i])}\n`
//   );
//   bar.increment();
// }
// bar.stop();

// ================ Vectorise ================

const dicts2 = [...readLines("../../knot-khovanov-t1-3-16-dict.out")].map(
  (line) => JSON.parse(line)
);
console.log(dicts2.length);

const maxDegree = max(
  dicts2.map((d) => max(Object.keys(d).map(Number).map(Math.abs)))
);
// const maxDegree = 45;
console.log("MAXDeg", maxDegree);

// // Calculating lines
console.log("Calculating lines");
const bar = createBar();
bar.start(dicts2.length, 1);
const lines = [];
for (let i = 0; i < dicts2.length; i++) {
  lines.push(
    range(-maxDegree, maxDegree + 1)
      .map((index) =>
        dicts2[i][String(index)] === undefined
          ? "0"
          : String(dicts2[i][String(index)])
      )
      .join(",")
  );
  bar.increment();
}
bar.stop();

// // Write
console.log("Writing file");
bar.start(lines.length, 1);
for (let i = 0; i < lines.length; i++) {
  fs.appendFileSync("data/knot-khovanov-t1-3-16-vect.out", `${lines[i]}\n`);
  bar.increment();
}
bar.stop();
