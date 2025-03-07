import { seq, getVs, getNbrs, eEq, getShortestCycleBounded } from "../evaluate";
import {
  coeffsToPolyMemoize,
  one,
  Poly,
  polyToPolyBase,
} from "../evaluate-poly";
import evaluateGraph, { coeffMult, coeffMultOne } from "../evaluate-q";
import evaluateGraphNew from "../evaluate-q-new"; // new version of evaluateGraph that uses the same strategy as this file (not tested much)
import type { Coeff } from "../evaluate-q";

// Crossings are 4 edge labels in anticlockwise order, starting with an undercrossing edge
// (Trivalent) vertices are 3 edge labels in anticlockwise order
// KnotIntermediate is an intermediate state of a knot, before completely broken down into a trivalent graph
export type Crossing = [number, number, number, number];
export type Vertex = [number, number, number];
export type KnotIntermediate = [Crossing[], Vertex[]];

// ***************** General Helpers *****************

// Counts elements in array and returns an object with type { [number in array]: count }
export function counter(arr: Array<number>): { [arrObj: number]: number } {
  const ret: { [arrObj: number]: number } = {};
  arr.forEach((e) => {
    ret[e] = (ret[e] ?? 0) + 1;
  });
  return ret;
}

// ***************** Functional sequencing knot manupulation *****************

// Replace edge `src` with `dst` inside KnotIntermediate `k`
export const replaceE =
  (src: number, dst: number) =>
  (k: KnotIntermediate): KnotIntermediate =>
    [
      k[0].map((x) => x.map((e) => (e === src ? dst : e)) as Crossing),
      k[1].map((x) => x.map((e) => (e === src ? dst : e)) as Vertex),
    ];

// (Function that) Connects `src` and `dst` inside KnotIntermediate input
export const connect = (src: number, dst: number) =>
  replaceE(Math.max(src, dst), Math.min(src, dst));

// Compares if two crossings are the same
export function compareX(x1: Crossing, x2: Crossing, rot = false) {
  if (!rot)
    return (
      x1[0] === x2[0] && x1[1] === x2[1] && x1[2] === x2[2] && x1[3] === x2[3]
    );
  else
    return (
      (x1[0] === x2[0] &&
        x1[1] === x2[1] &&
        x1[2] === x2[2] &&
        x1[3] === x2[3]) ||
      (x1[0] === x2[2] && x1[1] === x2[3] && x1[2] === x2[0] && x1[3] === x2[1])
    );
}

// Removes crossings from KnotIntermediate `k`
export const removeXs =
  (xs: Crossing[]) =>
  (k: KnotIntermediate): KnotIntermediate =>
    [
      k[0].filter((x: Crossing) => xs.findIndex((y) => compareX(x, y)) === -1),
      k[1],
    ];

// Adds vertices to KnotIntermediate `k`
export const appendVs =
  (vs: Vertex[]) =>
  (k: KnotIntermediate): KnotIntermediate =>
    [k[0], [...k[1], ...vs]];

// ***************** Specific Helpers *****************
export function pdToGraph(
  vs: Array<Crossing | Vertex>
): Array<[number, number]> {
  const vsFlat = vs.flat();
  const count = counter(vsFlat);
  const edges = [...new Set(vsFlat)].filter((e) => count[e] === 2);
  // vertex labels are exactly indices for the vertices in vs
  return edges
    .map((e) => vs.map((_, i) => i).filter((i) => vs[i].includes(e))) // adjacent vertices
    .map((e) => (e.length === 1 ? [e[0], e[0]] : e) as [number, number]); // loops should be [v,v] not [v]
}

export function pdDictToGraph(k: KnotIntermediate): Array<[number, number]> {
  return pdToGraph([...k[0], ...k[1]]);
}

// Edges that sit on the boundary of a bunch of vertices (think: boundary of a tangle)
export function boundary(vs: Vertex[]) {
  const vsFlat = vs.flat();
  const count = counter(vsFlat);
  return vsFlat.filter((v) => count[v] === 1);
}

// Check if two vertices are equal
export function vEq(v1: Vertex, v2: Vertex) {
  return v1[0] === v2[0] && v1[1] === v2[1] && v1[2] === v2[2];
}

// An ordering on vertices, for sorting
export function vGt(v1: Vertex, v2: Vertex) {
  if (v1[0] > v2[0]) return 1;
  if (v1[0] < v2[0]) return -1;
  if (v1[1] > v2[1]) return 1;
  if (v1[1] < v2[1]) return -1;
  if (v1[2] > v2[2]) return 1;
  if (v1[2] < v2[2]) return -1;
  return -1;
}

// var("q")
// R = LaurentPolynomialRing(ZZ, "q")
// circle = q_int(3)
// c1 = q^-2 - 1
// c2 = q^2
// # for unscaled I=H relation
// c3 = -1
// cUntwist1 = simplify(q^2 + (q^-2 - 1) * circle)
// cUntwist2 = simplify(q^-2 + (q^2 - 1) * circle)
// cUntwist1Circle = simplify(cUntwist1 * circle)
// cUntwist2Circle = simplify(cUntwist2 * circle)

// Applys equation breaking a crossing down into some linear combination of non-crossing webs
export function breakdown(
  c: Coeff[],
  k: KnotIntermediate
): Array<[Coeff[], KnotIntermediate]> {
  if (
    c.length === 0 ||
    c.every((cc) => Object.keys(cc).length === 0) ||
    c.every((cc) => cc?.[1] === 0)
  )
    return [];

  const crossings = k[0];
  if (crossings.length === 0) return [[c, k]];
  const x = crossings[0];
  const xSetLen = new Set(x).size;
  k = [k[0].slice(1), k[1]];

  // Different ways a crossing can be (needed because the program can't see circles)
  if (xSetLen === 4) {
    const k1 = seq(
      // ii
      k,
      [connect(x[1], x[0]), connect(x[3], x[2])]
    );
    const k2 = seq(
      // u,n
      k,
      [connect(x[2], x[1]), connect(x[3], x[0])]
    );
    const nextE = Math.max(...[...k[0], ...k[1]].flat()) + 1;
    const k3 = seq(
      // H
      k,
      [
        appendVs([
          [x[0], x[1], nextE],
          [x[2], x[3], nextE],
        ]),
      ]
    );
    return [
      [c.map((cc) => coeffMultOne(cc, "c1", 1)), k1],
      [c.map((cc) => coeffMultOne(cc, "c2", 1)), k2],
      [c.map((cc) => coeffMultOne(cc, "c3", 1)), k3],
    ];
  } else if (xSetLen === 3) {
    // Crossing loops on itself

    const xRot =
      x[1] === x[2] || x[2] === x[3] ? [...x.slice(2), ...x.slice(0, 2)] : x; // rotate so repeated edge is at x[0]
    if (xRot[0] === xRot[1])
      return [
        [
          c.map((cc) => coeffMultOne(cc, "cUntwist1", 1)),
          seq(k, [connect(xRot[3], xRot[2])]),
        ],
      ];
    // xRot[0] === xRot[3]
    else
      return [
        [
          c.map((cc) => coeffMultOne(cc, "cUntwist2", 1)),
          seq(k, [connect(xRot[2], xRot[1])]),
        ],
      ];
  } else {
    // len(set(x)) === 2
    // // Crossing is like an infinity symbol

    // [a,a,b,b]
    if (x[0] === x[1])
      return [[c.map((cc) => coeffMultOne(cc, "cUntwist1Circle", 1)), k]];
    // x[0] === x[3] // [a,b,b,a]
    else return [[c.map((cc) => coeffMultOne(cc, "cUntwist2Circle", 1)), k]];
  }
}

// #### Original Variables ####
// # ihx2 = 1
// # ihx3 = -1
// # circle = q_int(3)
// c2x1 = (circle - 1)
// c3x1 = (circle - 2)
// c4x0 = (circle - 3)
// c4x1 = 1
// c4x2 = (circle - 2)
// c5x0 = (circle - 3)
// c5x1 = (circle - 2)
// c5x2 = 1
// c5x3 = (circle - 2)
// c5x4 = -1
// c2x1Circle = expand(c2x1 * circle)

// Cleans up non-knot parts of knots
// To run between breakdowns (improves runtime)
export function clean(
  c: Coeff[],
  k: KnotIntermediate
): Array<[Coeff[], KnotIntermediate]> {
  if (
    c.length === 0 ||
    c.every((cc) => Object.keys(cc).length === 0) ||
    c.every((cc) => cc?.[1] === 0)
  )
    return [];
  const threes = k[1];

  // 1-gon
  if (threes.filter((v) => new Set(v).size === 2).length > 0) return [];

  // // skip non-knot
  // if (k[0].length === 0) return [[c, k]];

  // const cycleIdx = getShortestCycleBounded(pdToGraph(threes), 3);
  // if (cycleIdx.length !== 2 && cycleIdx.length !== 3) return [[c, k]];
  // const cycle = cycleIdx.map((i) => threes[i]); // cycle given by indices in `threes`

  // // 2-gon etc.
  // if (cycle.length === 2) {
  //   const kk = [
  //     k[0],
  //     threes.filter((_, i) => !cycleIdx.includes(i)),
  //   ] as KnotIntermediate;
  //   if (new Set(cycle[0].filter((v) => cycle[1].includes(v))).size === 3) {
  //     // Triple multiedge
  //     return clean(
  //       c.map((cc) => coeffMult(cc, { c2x1: 1, circle: 1 })),
  //       kk
  //     );
  //   } else {
  //     const bdry = boundary(cycle);
  //     const k1 = seq(kk, [connect(Math.max(...bdry), Math.min(...bdry))]);
  //     return clean(
  //       c.map((cc) => coeffMultOne(cc, "c2x1", 1)),
  //       k1
  //     );
  //   }
  // } else if (cycle.length === 3) {
  //   const kk = [
  //     k[0],
  //     threes.filter((_, i) => !cycleIdx.includes(i)),
  //   ] as KnotIntermediate;
  //   const bdry = boundary(cycle) as Vertex; // because cycle.length == 3
  //   const k1 = seq(kk, [appendVs([bdry])]);
  //   return clean(
  //     c.map((cc) => coeffMultOne(cc, "c3x1", 1)),
  //     k1
  //   );
  // } else if (cycle.length === 4) {
  //   const kk = [
  //     k[0],
  //     threes.filter((_, i) => !cycleIdx.includes(i)),
  //   ] as KnotIntermediate;
  //   const bdry = boundary(cycle);
  //   const interior = [...new Set(cycle.flat())]
  //     .filter((e) => bdry.includes(e))
  //     .toSorted((a, b) => a - b);
  //   const k0 = seq(kk, [
  //     appendVs([
  //       [bdry[0], interior[0], bdry[3]],
  //       [bdry[2], interior[0], bdry[1]],
  //     ]),
  //   ]);
  //   const k1 = seq(kk, [connect(bdry[0], bdry[1]), connect(bdry[2], bdry[3])]);
  //   const k2 = seq(kk, [connect(bdry[0], bdry[3]), connect(bdry[1], bdry[2])]);
  //   return [
  //     ...clean(
  //       c.map((cc) => coeffMultOne(cc, "c4x0", 1)),
  //       k0
  //     ),
  //     ...clean(
  //       c.map((cc) => coeffMultOne(cc, "c4x1", 1)),
  //       k1
  //     ),
  //     ...clean(
  //       c.map((cc) => coeffMultOne(cc, "c4x2", 1)),
  //       k2
  //     ),
  //   ];
  // } else if (cycle.length === 5) {
  //   const kk = [
  //     k[0],
  //     threes.filter((_, i) => !cycleIdx.includes(i)),
  //   ] as KnotIntermediate;
  //   const bdry = boundary(cycle);
  //   const interior = [...new Set(cycle.flat())]
  //     .filter((e) => bdry.includes(e))
  //     .toSorted((a, b) => a - b);
  //   const k0 = seq(kk, [
  //     appendVs([
  //       [bdry[0], bdry[1], interior[0]],
  //       [bdry[4], interior[0], interior[1]],
  //       [bdry[3], interior[1], bdry[2]],
  //     ]),
  //   ]);
  //   const k1 = seq(kk, [
  //     connect(bdry[0], bdry[1]),
  //     appendVs([[bdry[2], bdry[3], bdry[4]]]),
  //   ]);
  //   const k2 = seq(kk, [
  //     connect(bdry[0], bdry[4]),
  //     appendVs([[bdry[1], bdry[2], bdry[3]]]),
  //   ]);
  //   const k3 = seq(kk, [
  //     connect(bdry[2], bdry[3]),
  //     appendVs([[bdry[0], bdry[1], bdry[4]]]),
  //   ]);
  //   const k4 = seq(kk, [
  //     appendVs([
  //       [bdry[1], bdry[2], interior[0]],
  //       [bdry[0], interior[0], interior[1]],
  //       [bdry[4], interior[1], bdry[3]],
  //     ]),
  //   ]);
  //   return [
  //     ...clean(
  //       c.map((cc) => coeffMultOne(cc, "c5x0", 1)),
  //       k0
  //     ),
  //     ...clean(
  //       c.map((cc) => coeffMultOne(cc, "c5x1", 1)),
  //       k1
  //     ),
  //     ...clean(
  //       c.map((cc) => coeffMultOne(cc, "c5x2", 1)),
  //       k2
  //     ),
  //     ...clean(
  //       c.map((cc) => coeffMultOne(cc, "c5x3", 1)),
  //       k3
  //     ),
  //     ...clean(
  //       c.map((cc) => coeffMultOne(cc, "c5x4", 1)),
  //       k4
  //     ),
  //   ];
  // }
  // return [[c, k]];

  // Iterative for 1,2,3 cycles
  let cycleIdx = getShortestCycleBounded(pdToGraph(k[1]), 3);
  while (
    cycleIdx.length === 1 ||
    cycleIdx.length === 2 ||
    cycleIdx.length === 3
  ) {
    const cycle = cycleIdx.map((i) => k[1][i]);
    k = [
      k[0],
      k[1].filter((_, i) => !cycleIdx.includes(i)),
    ] as KnotIntermediate;
    if (cycle.length === 1) return [];
    else if (cycle.length === 2) {
      // 2-gon
      if (new Set(cycle[0].filter((v) => cycle[1].includes(v))).size === 3) {
        // Triple multiedge
        for (let i = 0; i < c.length; i++) {
          c[i] = coeffMultOne(c[i], "c2x1Circle", 1, true);
          // c[i] = coeffMult(c[i], { c2x1: 1, circle: 1 }, true);
        }
      } else {
        const bdry = boundary(cycle);
        const k1 = seq(k, [connect(Math.max(...bdry), Math.min(...bdry))]);
        for (let i = 0; i < c.length; i++) {
          c[i] = coeffMultOne(c[i], "c2x1", 1, true);
        }
        k = k1;
      }
    } else if (cycle.length === 3) {
      const bdry = boundary(cycle) as Vertex;
      const k1 = seq(k, [appendVs([bdry])]);
      for (let i = 0; i < c.length; i++) {
        c[i] = coeffMultOne(c[i], "c3x1", 1, true);
      }
      k = k1;
    }
    cycleIdx = getShortestCycleBounded(pdToGraph(k[1]), 3);
  }
  return [[c, k]];
}

// A "good enough" check if two intermediate knots are the same (can have false negatives)
// A better check will recognise more that are the same, but take longer
export function same(k1: KnotIntermediate, k2: KnotIntermediate): boolean {
  const fours1 = k1[0];
  const fours2 = k2[0];
  if (fours1.length !== fours2.length) return false;
  for (const x of fours1) {
    if (fours2.findIndex((xx) => compareX(x, xx, true)) < 0) {
      return false;
    }
  }
  // we don't need to check the other inclusion because
  // we shouldn't have duplicates (need more crossings, or virtual ones)

  const threes1 = k1[1].toSorted(vGt);
  const threes2 = k2[1].toSorted(vGt);
  // bdry1 = boundary(threes1)
  // bdry2 = boundary(threes2)
  // // if set(bdry1) != set(bdry2):
  // //     return False

  // "literally the same thing"
  // const eqSet = <T>(xs: Set<T>, ys: Set<T>) =>
  //   xs.size === ys.size && [...xs].every((x) => ys.has(x));
  if (
    threes1.length === threes2.length &&
    Array.from(Array(threes1.length).keys()).every((i) =>
      vEq(threes1[i], threes2[i])
    )

    // // alternative using set equality of strings
    // eqSet(
    //   new Set(threes1.map((v) => JSON.stringify(v.toSorted()))),
    //   new Set(threes2.map((v) => JSON.stringify(v.toSorted())))
    // )
  ) {
    // global countingvariable; countingvariable += 1
    return true;
  }

  // // interior1 = list(set([e for e in flatten(threes1) if e not in bdry1]))
  // // interior2 = list(set([e for e in flatten(threes2) if e not in bdry2]))
  // // if len(interior1) != len(interior2):
  // //     return False
  // // really slow but surefire way to check isomorphism
  // // for perm in permutations(interior1):
  // //     print(perm)
  return false;
}

export function evaluateKnot(kIn: Crossing[]): [Coeff[], Poly][] {
  const kIn2 = [kIn, []] as KnotIntermediate; // store the crossings and trivalent separately
  let outputKnots = breakdown([{ 1: 1 }], kIn2); // (coeff, knot), run breakdown once
  while (
    outputKnots
      .map(([_, k]) => k[0].length)
      .reduce((acc, cur) => acc + cur, 0) > 0
  ) {
    outputKnots = outputKnots.map(([c, k]) => breakdown(c, k)).flat();
    outputKnots = outputKnots.map(([c, k]) => clean(c, k)).flat(); // clean

    // Group the "same knots together"
    let outputKnotsTemp: [Coeff[], KnotIntermediate][] = [];
    while (outputKnots.length > 0) {
      const [_, k1] = outputKnots[0];

      const ks: number[] = [];
      for (let i = 0; i < outputKnots.length; i++) {
        if (i === 0 || same(k1, outputKnots[i][1])) ks.push(i);
      }

      const collected: [Coeff[], KnotIntermediate][] = [];
      const other: [Coeff[], KnotIntermediate][] = [];
      outputKnots.forEach((e, i) =>
        ks.includes(i as number) ? collected.push(e) : other.push(e)
      );
      outputKnots = other;
      outputKnotsTemp.push([collected.map(([c, _]) => c).flat(), k1]);
    }
    outputKnots = outputKnotsTemp;
  }

  // Evaluate the trivalent graphs that remain
  let total: [Coeff[], Poly][] = [];
  for (let i = 0; i < outputKnots.length; i++) {
    const [c, k] = outputKnots[i];
    if (k[1].length === 0) total.push([c, one()]);
    else {
      const ev = evaluateGraph(pdDictToGraph(k));
      // const ev = evaluateGraphNew(pdDictToGraph(k));
      total.push([c, ev]);
    }
  }

  // Output isn't a full polynomial, so more work needs to be done to add them up
  return total;
}
