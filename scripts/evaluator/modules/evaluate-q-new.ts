import {
  getConnectedComponents,
  getShortestCycle,
  getOtherNbrs,
  seq,
  removeVs,
  connectV,
  getShortestCycleBounded,
  eGt,
  eEq,
} from "./evaluate";

import {
  one,
  zero,
  isZero,
  basicPolys,
  karatsuba,
  polyProd,
  polySum,
} from "./evaluate-poly";
import type { Poly } from "./evaluate-poly";

/**************** Evaluate graphs with quantum relations *****************/

/*
What the entries mean:
- 1: 1
- ihx2 = 1
- ihx3 = -1
- c2x1 = (circle - 1)
- c3x1 = (circle - 2)
- c4x0 = (circle - 3)
- c4x1 = 1
- c4x2 = (circle - 2)
- c5x0 = (circle - 3)
- c5x1 = (circle - 2)
- c5x2 = 1
- c5x3 = (circle - 2)
- c5x4 = -1
- c2x1Circle = expand(c2x1 * circle)
*/

// can take non-planar graphs
export default function evaluateGraph(g: Array<[number, number]>): Poly {
  let output = clean(one(), g);
  while (
    output.map(([_, e]) => e.length).reduce((acc, cur) => acc + cur, 0) > 0
  ) {
    output = output.map(([c, k]) => breakdown(c, k)).flat();
    output = output.map(([c, k]) => clean(c, k)).flat(); // clean

    let outputTemp: Array<[Poly, Array<[number, number]>]> = [];
    while (output.length > 0) {
      const [_, g1] = output[0];

      const sameIdx: number[] = [];
      for (let i = 0; i < output.length; i++) {
        if (i === 0 || same(g1, output[i][1])) sameIdx.push(i);
      }

      const collected: Array<[Poly, Array<[number, number]>]> = [];
      const other: Array<[Poly, Array<[number, number]>]> = [];
      output.forEach((e, i) =>
        sameIdx.includes(i as number) ? collected.push(e) : other.push(e)
      );
      output = other;
      outputTemp.push([polySum(collected.map(([c, _]) => c)), g1]);
    }
    output = outputTemp;
  }

  return polySum(output.map(([c, _]) => c));
}

export function breakdown(
  c: Poly,
  g: Array<[number, number]>
): Array<[Poly, Array<[number, number]>]> {
  if (isZero(c)) return [];
  if (g.length === 0) return [[c, g]];

  // Pick the smallest cycle and look at not-in-cycle neighbours
  const cycle = getShortestCycle(g);
  const vs = getOtherNbrs(g, cycle).flat();

  if (cycle.length === 1) {
    return [];
  } else if (cycle.length === 2) {
    // Bigon
    if (vs.length === 0) {
      // Triple multiedge (vs.length === 0)
      const g1 = seq(g, [removeVs(cycle)]);
      return [[karatsuba(c, basicPolys.c2x1Circle), g1]];
    } else {
      // Double multiedge (vs.length === 2)
      const g1 = seq(g, [removeVs(cycle), connectV(vs[0], vs[1])]);
      return [[karatsuba(c, basicPolys.c2x1), g1]];
    }
  } else if (cycle.length === 3) {
    // Triangle
    const g1 = seq(g, [
      removeVs(cycle),
      connectV(vs[0], cycle[0]),
      connectV(vs[1], cycle[0]),
      connectV(vs[2], cycle[0]),
    ]);
    // return evaluateGraph(g1);
    return [[karatsuba(c, basicPolys.c3x1), g1]];
  } else if (cycle.length === 4) {
    // Square (vs.length === 4)
    const g0 = seq(g, [
      removeVs([cycle[2], cycle[3]]),
      connectV(cycle[0], vs[3]),
      connectV(cycle[1], vs[2]),
    ]);
    const g1 = seq(g, [
      removeVs(cycle),
      connectV(vs[0], vs[1]),
      connectV(vs[2], vs[3]),
    ]);
    const g2 = seq(g, [
      removeVs(cycle),
      connectV(vs[0], vs[3]),
      connectV(vs[1], vs[2]),
    ]);
    return [
      [karatsuba(c, basicPolys.c4x0), g0],
      [karatsuba(c, basicPolys.c4x1), g1],
      [karatsuba(c, basicPolys.c4x2), g2],
    ];
  } else if (cycle.length === 5) {
    // Pentagon (vs.length === 5)
    const g0 = seq(g, [
      removeVs([cycle[3], cycle[4]]),
      connectV(vs[3], cycle[2]),
      connectV(vs[4], cycle[0]),
    ]);
    const g1 = seq(g, [
      removeVs(cycle),
      connectV(vs[0], vs[4]),
      connectV(vs[1], cycle[2]),
      connectV(vs[2], cycle[2]),
      connectV(vs[3], cycle[2]),
      // connectV(vs[4], vs[0]),
    ]);
    const g2 = seq(g, [
      removeVs(cycle),
      connectV(vs[0], vs[1]),
      // connectV(vs[1], vs[0]),
      connectV(vs[2], cycle[3]),
      connectV(vs[3], cycle[3]),
      connectV(vs[4], cycle[3]),
    ]);
    const g3 = seq(g, [
      removeVs(cycle),
      connectV(vs[0], cycle[0]),
      connectV(vs[1], cycle[0]),
      connectV(vs[2], vs[3]),
      // connectV(vs[3], vs[2]),
      connectV(vs[4], cycle[0]),
    ]);
    const g4 = seq(g, [
      removeVs([2, 3].map((i) => cycle[i])),
      connectV(vs[2], cycle[1]),
      connectV(vs[3], cycle[4]),
    ]);
    return [
      [karatsuba(c, basicPolys.c5x0), g0],
      [karatsuba(c, basicPolys.c5x1), g1],
      [karatsuba(c, basicPolys.c5x2), g2],
      [karatsuba(c, basicPolys.c5x3), g3],
      [karatsuba(c, basicPolys.c5x4), g4],
    ];
  } else {
    // Larger than pentagon (vs.length >= 6)
    // use I=H relation
    // Note: the I=H relation reduces the face given by `cycle`.
    //       The next iteration won't undo it, as it is applied on the smallest face

    // We just use cycle[1] and cycle[2]
    const g1 = seq(g, [
      removeVs([cycle[1], cycle[2]]),
      connectV(cycle[1], cycle[0]),
      connectV(cycle[1], cycle[3]),
      connectV(cycle[1], cycle[2]),
      connectV(cycle[2], vs[1]),
      connectV(cycle[2], vs[2]),
    ]);
    const g2 = seq(g, [
      removeVs([cycle[1], cycle[2]]),
      connectV(cycle[0], cycle[3]),
      connectV(vs[1], vs[2]),
    ]);
    const g3 = seq(g, [
      removeVs([cycle[1], cycle[2]]),
      connectV(cycle[0], vs[1]),
      connectV(cycle[3], vs[2]),
    ]);
    return [
      [c, g1],
      [karatsuba(c, basicPolys.ihx2), g2],
      [karatsuba(c, basicPolys.ihx3), g3],
    ];
  }
}

export function clean(
  c: Poly,
  g: Array<[number, number]>
): Array<[Poly, Array<[number, number]>]> {
  if (isZero(c)) return [];
  if (g.length === 0) return [[c, g]];

  // Pick the smallest cycle and look at not-in-cycle neighbours
  let cycle = getShortestCycleBounded(g, 3);
  while (cycle.length === 1 || cycle.length === 2 || cycle.length === 3) {
    const vs = getOtherNbrs(g, cycle).flat();

    g = seq(g, [removeVs(cycle)]);
    if (cycle.length === 1) return [];
    else if (cycle.length === 2) {
      // 2-gon
      if (vs.length === 0) {
        // Triple multiedge

        // for (let i = 0; i < c.length; i++) {
        //   c[i] = coeffMultOne(c[i], "c2x1Circle", 1, true);
        // }

        c = karatsuba(c, basicPolys.c2x1Circle);
      } else {
        // Double multiedge (vs.length === 2)

        // for (let i = 0; i < c.length; i++) {
        //   c[i] = coeffMultOne(c[i], "c2x1", 1, true);
        // }

        c = karatsuba(c, basicPolys.c2x1);
        g = seq(g, [connectV(vs[0], vs[1])]);
      }
    } else if (cycle.length === 3) {
      // Triangle

      // for (let i = 0; i < c.length; i++) {
      //   c[i] = coeffMultOne(c[i], "c3x1", 1, true);
      // }

      c = karatsuba(c, basicPolys.c3x1);
      g = seq(g, [
        connectV(vs[0], cycle[0]),
        connectV(vs[1], cycle[0]),
        connectV(vs[2], cycle[0]),
      ]);
    }
    cycle = getShortestCycleBounded(g, 3);
  }
  return [[c, g]];
}

export function same(
  g1: Array<[number, number]>,
  g2: Array<[number, number]>
): boolean {
  g1 = g1.toSorted(eGt);
  g2 = g2.toSorted(eGt);

  // "literally the same thing"
  if (
    g1.length === g2.length &&
    Array.from(Array(g1.length).keys()).every((i) => eEq(g1[i], g2[i]))
  ) {
    return true;
  }
  return false;
}
