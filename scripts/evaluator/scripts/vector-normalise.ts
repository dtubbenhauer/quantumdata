import fs from "fs";

import { readLines, writeLines } from "./helper/basic-readwrite";
import { readLine, mapLines } from "./helper/large-readwrite";
import { range, max, min, sum } from "./helper/array-util";
import { createBar } from "./helper/bar";

// const type = "khovanov-t1";
// const filename = `../../knot-${type}-3-16-trimmedvect.out`;

const type = "khovanov";
const filename = `../../knot-${type}-3-16-vect.out`;

mapLines(filename, (line) => {
  const numbers = line.split(",").map(Number);
  const normaliser = Math.sqrt(sum(numbers.map((n) => n * n)));
  return { numbers, normaliser };
})
  .then((res) => {
    const normaliser = max(res.map(({ normaliser }) => normaliser));
    return res.map(({ numbers }) => numbers.map((n) => (10 * n) / normaliser));
  })
  .then((lines) => {
    // // Write
    // console.log("Writing file");
    // const bar = createBar();
    // bar.start(lines.length, 0);
    // for (let i = 0; i < lines.length; i++) {
    //   fs.appendFileSync(
    //     `../../knot-${type}-3-16-vect-normalised.out`,
    //     `${lines[i].map((n) => Math.round(n * 1000000) / 1000000)}\n`
    //   );
    //   bar.increment();
    // }
    // bar.stop();

    // // Write floats list to a binary file
    let wstream;

    for (let i = 0; i < lines.length; i++) {
      if (i % 100000 === 0) {
        wstream?.end();
        wstream = fs.createWriteStream(
          `../../knot-${type}-3-16-trimmednormalisedvect.bin${i}.out`
        );
      }
      const data = new Float32Array(lines[i]);
      const buffer = Buffer.allocUnsafe(data.length * 4);
      for (let j = 0; j < data.length; j++) {
        //write the float in Little-Endian and move the offset
        buffer.writeFloatLE(data[j], j * 4);
      }
      wstream?.write(buffer);
    }
    wstream?.end();
  });
