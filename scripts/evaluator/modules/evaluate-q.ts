import {
  getConnectedComponents,
  getShortestCycle,
  getOtherNbrs,
  seq,
  removeVs,
  connectV,
} from "./evaluate";

import {
  one,
  zero,
  basicPolys,
  karatsuba,
  polyProd,
  polySum,
} from "./evaluate-poly";
import type { Poly } from "./evaluate-poly";

/**************** Evaluate graphs with quantum relations *****************/

export type Coeff = {
  [coeff: number | string]: number;
};

export function coeffMult(c1: Coeff, c2: Coeff, inplace = false) {
  if (inplace) {
    Object.keys(c2).forEach((k) => {
      if (k === String(1)) c1[k] = (c1[k] ?? 1) * c2[k];
      else c1[k] = (c1[k] ?? 0) + c2[k];
    });
    return c1;
  }
  const ret = { ...c1 };
  Object.keys(c2).forEach((k) => {
    if (k === String(1)) ret[k] = (ret[k] ?? 1) * c2[k];
    else ret[k] = (ret[k] ?? 0) + c2[k];
  });
  return ret;
}

export function coeffMultOne(
  c: Coeff,
  k: string | number,
  v: number,
  inplace = false
) {
  if (inplace) {
    if (String(k) === String(1)) c[k] = (c[k] ?? 1) * v;
    else c[k] = (c[k] ?? 0) + 1;
    return c;
  }
  const ret = { ...c };
  if (String(k) === String(1)) ret[k] = (ret[k] ?? 1) * v;
  else ret[k] = (ret[k] ?? 0) + 1;
  return ret;
}

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
  let value = 1;
  // Connected components
  const components = getConnectedComponents(g);
  return polyProd(components.map((c) => evaluateGraphConnected(c)));
}

// Function for connected graphs
export function evaluateGraphConnected(g: Array<[number, number]>): Poly {
  // if (isZero(g)) return 0; // checking this takes a lot of time!

  // Pick the smallest cycle and look at not-in-cycle neighbours
  const cycle = getShortestCycle(g);
  const vs = getOtherNbrs(g, cycle).flat();

  if (cycle.length === 1) {
    return zero();
  } else if (cycle.length === 2) {
    // Bigon
    if (vs.length === 0) {
      // Triple multiedge (vs.length === 0)
      return karatsuba(basicPolys.c2x1, basicPolys.circle);
    } else {
      // Double multiedge (vs.length === 2)
      const g1 = seq(g, [removeVs(cycle), connectV(vs[0], vs[1])]);
      return karatsuba(evaluateGraphConnected(g1), basicPolys.c2x1);
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
    return karatsuba(evaluateGraphConnected(g1), basicPolys.c3x1);
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
    return polySum([
      karatsuba(evaluateGraph(g0), basicPolys.c4x0),
      karatsuba(evaluateGraph(g1), basicPolys.c4x1),
      karatsuba(evaluateGraph(g2), basicPolys.c4x2),
    ]);
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
    return polySum([
      karatsuba(evaluateGraph(g0), basicPolys.c5x0),
      karatsuba(evaluateGraph(g1), basicPolys.c5x1),
      karatsuba(evaluateGraph(g2), basicPolys.c5x2),
      karatsuba(evaluateGraph(g3), basicPolys.c5x3),
      karatsuba(evaluateGraph(g4), basicPolys.c5x4),
    ]);
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
    return polySum([
      evaluateGraph(g1),
      karatsuba(evaluateGraph(g2), basicPolys.ihx2),
      karatsuba(evaluateGraph(g3), basicPolys.ihx3),
    ]);
  }
}
