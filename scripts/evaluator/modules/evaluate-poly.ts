import type { Coeff } from "./evaluate-q";

export type PolyBase = { [power: number]: number };
export type Poly = [number, PolyBase];
// the first component is the power of q to multiply to get the actual polynomial

export function polyToPolyBase(p: Poly): PolyBase {
  const res: PolyBase = {};
  Object.keys(p[1]).forEach((kStr) => {
    const k = Number(kStr);
    if (p[1][k] !== 0) res[k + p[0]] = p[1][k];
  });
  return res;
}

export function rescaleQ(p: PolyBase, scale: number): PolyBase {
  const res: PolyBase = {};
  Object.keys(p).forEach((kStr) => {
    const k = Number(kStr);
    res[scale * k] = p[k];
  });
  return res;
}

export function isConst(p: Poly): boolean {
  return Object.entries(p[1]).every(([k, v]) => {
    const pwr = Number(k) + p[0];
    if (pwr !== 0) return v === 0;
    else return true;
  });
}

export function isZero(p: Poly): boolean {
  return Object.keys(p[1])
    .map(Number)
    .every((k) => p[1][k] === 0);
}

export function polyEq(p1: Poly, p2: Poly): boolean {
  const powers = [
    ...new Set([
      ...Object.keys(p1[1]).map((k) => Number(k) + p1[0]),
      ...Object.keys(p2[1]).map((k) => Number(k) + p2[0]),
    ]),
  ];
  const isNonValue = (d: { [key: number]: number }, k: number) => {
    return !Object.keys(d).includes(String(k)) || d[k] === 0;
  };
  for (const n of powers) {
    if (
      !(isNonValue(p1[1], n - p1[0]) && isNonValue(p2[1], n - p2[0])) &&
      p1[1][n - p1[0]] !== p2[1][n - p2[0]]
    ) {
      return false;
    }
  }
  return true;
}

export function normalise(p: Poly): Poly {
  const keys = Object.keys(p[1]).map(Number);
  const min = Math.min(...keys);
  if (min === 0) {
    return p;
  }
  const r: PolyBase = {};
  keys.map((k) => {
    r[k - min] = p[1][k];
  });
  return [p[0] + min, r];
}

function splitAt(p: Poly, pwr: number): [Poly, Poly] {
  const left: PolyBase = { 0: 0 };
  const right: PolyBase = { 0: 0 };
  for (const kStr of Object.keys(p[1])) {
    const k = Number(kStr);
    if (p[1][k] === 0) continue;
    if (k < pwr) left[k] = p[1][k];
    else right[k - pwr] = p[1][k];
  }
  return [
    [p[0], left],
    [p[0], right],
  ];
}

export function one(): Poly {
  return [0, { 0: 1 }];
}

export function zero(): Poly {
  return [0, { 0: 0 }];
}

export function dumbMult(p1: Poly, p2: Poly): Poly {
  const r: PolyBase = { 0: 0 };
  if (isConst(p2)) {
    const tmp = p1;
    p1 = p2;
    p2 = tmp;
  }
  for (const k1Str of Object.keys(p1[1])) {
    const k1 = Number(k1Str);
    if (p1[1][k1] === 0) continue;
    else {
      for (const k2Str of Object.keys(p2[1])) {
        const k2 = Number(k2Str);
        if (p2[1][k2] === 0) continue;
        const pwr = k1 + k2;
        r[pwr] = (r[pwr] ?? 0) + p1[1][k1] * p2[1][k2];
      }
    }
  }
  return [p1[0] + p2[0], r];
}
export function dumbAdd(p1: Poly, p2: Poly): Poly {
  let base, other;
  if (p1[0] <= p2[0]) {
    base = p1;
    other = p2;
  } else {
    base = p2;
    other = p1;
  }
  const diff = other[0] - base[0];

  const r: PolyBase = { ...base[1] };
  for (const kStr of Object.keys(other[1])) {
    const k = Number(kStr);
    if (other[1][k] === 0) continue;
    else r[k + diff] = (r[k + diff] ?? 0) + other[1][k];
  }
  return [base[0], r];
}

export function dumbNeg(p: Poly): Poly {
  const r: PolyBase = {};
  Object.keys(p[1]).forEach((kStr) => {
    const k = Number(kStr);
    if (p[1][k] !== 0) r[k] = -p[1][k];
  });
  return [p[0], r];
}

export const basicPolys: { [name: string]: Poly } = {
  ihx2: [0, { 0: 1 }],
  ihx3: [0, { 0: -1 }],
  circle: [-2, { 0: 1, 2: 1, 4: 1 }],
  c2x1: [-2, { 0: 1, 4: 1 }],
  c3x1: [-2, { 0: 1, 2: -1, 4: 1 }],
  c4x0: [-2, { 0: 1, 2: -2, 4: 1 }],
  c4x1: [0, { 0: 1 }],
  c4x2: [-2, { 0: 1, 2: -1, 4: 1 }],
  c5x0: [-2, { 0: 1, 2: -2, 4: 1 }],
  c5x1: [-2, { 0: 1, 2: -1, 4: 1 }],
  c5x2: [0, { 0: 1 }],
  c5x3: [-2, { 0: 1, 2: -1, 4: 1 }],
  c5x4: [0, { 0: -1 }],
  c2x1Circle: [-4, { 0: 1, 2: 1, 4: 2, 6: 1, 8: 1 }],
  c1: [-2, { 0: 1, 2: -1 }],
  c2: [2, { 0: 1 }],
  c3: [0, { 0: -1 }],
  cUntwist1: [-4, { 0: 1 }],
  cUntwist2: [4, { 0: 1 }],
  cUntwist1Circle: [-6, { 0: 1, 2: 1, 4: 1 }],
  cUntwist2Circle: [2, { 0: 1, 2: 1, 4: 1 }],
};

export function coeffToPoly(c: Coeff): Poly {
  let ret: Poly = [0, { 0: c[1] }];
  const update = (key: string) => {
    if (c[key] !== undefined && c[key] !== 0) {
      ret = karatsuba(ret, karatsubaPow(basicPolys[key], c[key]));
    }
  };
  update("c1");
  update("c2");
  update("c3");
  update("cUntwist1");
  update("cUntwist2");
  update("cUntwist1Circle");
  update("cUntwist2Circle");
  update("ihx2");
  update("ihx3");
  update("circle");
  update("c2x1");
  update("c3x1");
  update("c4x0");
  update("c4x1");
  update("c4x2");
  update("c5x0");
  update("c5x1");
  update("c5x2");
  update("c5x3");
  update("c5x4");
  update("c2x1Circle");
  return ret;
}

export function eqCoeff(c1: Coeff, c2: Coeff) {
  if (c1["c1"] !== c2["c1"]) return false;
  if (c1["c2"] !== c2["c2"]) return false;
  if (c1["c3"] !== c2["c3"]) return false;
  if (c1["cUntwist1"] !== c2["cUntwist1"]) return false;
  if (c1["cUntwist2"] !== c2["cUntwist2"]) return false;
  if (c1["cUntwist1Circle"] !== c2["cUntwist1Circle"]) return false;
  if (c1["cUntwist2Circle"] !== c2["cUntwist2Circle"]) return false;
  if (c1["ihx2"] !== c2["ihx2"]) return false;
  if (c1["ihx3"] !== c2["ihx3"]) return false;
  if (c1["circle"] !== c2["circle"]) return false;
  if (c1["c2x1"] !== c2["c2x1"]) return false;
  if (c1["c3x1"] !== c2["c3x1"]) return false;
  if (c1["c4x0"] !== c2["c4x0"]) return false;
  if (c1["c4x1"] !== c2["c4x1"]) return false;
  if (c1["c4x2"] !== c2["c4x2"]) return false;
  if (c1["c5x0"] !== c2["c5x0"]) return false;
  if (c1["c5x1"] !== c2["c5x1"]) return false;
  if (c1["c5x2"] !== c2["c5x2"]) return false;
  if (c1["c5x3"] !== c2["c5x3"]) return false;
  if (c1["c5x4"] !== c2["c5x4"]) return false;
  if (c1["c2x1Circle"] !== c2["c2x1Circle"]) return false;
  return true;
}

// WARNING: this edits the original data structure
export function collectCoeff(csIn: [Coeff[], Poly][]): [Coeff, Poly][] {
  // Expand out into a sum of [Coeff, Poly]
  let cs: [Coeff, Poly][] = csIn
    .map(([coeffs, poly]) => coeffs.map((c) => [c, poly] as [Coeff, Poly]))
    .flat();
  const ret: [Coeff, Poly][] = [];
  while (cs.length > 0) {
    let collected: Poly[] = [];
    const other: [Coeff, Poly][] = [];
    cs.forEach((c, i) => {
      if (i === 0 || eqCoeff(cs[0][0], c[0])) collected.push(c[1]);
      else other.push(c);
    });
    ret.push([cs[0][0], polySum(collected)]);
    cs = other;
  }
  return ret;
}

export function coeffsToPoly(cs: Coeff[]): Poly {
  if (cs.length === 0) return [0, { 0: 0 }];
  let res = coeffToPoly(cs[0]);
  for (let i = 1; i < cs.length; i++) {
    res = dumbAdd(res, coeffToPoly(cs[i]));
  }
  return res;
}

export function coeffsToPolyMemoize(
  cs: Coeff[],
  mem: { [name: string]: Poly[] } = {}
): Poly {
  const powMemoize = (name: string, n: number): Poly => {
    if (n < 0) throw Error("Error in powMemoize: n is negative");
    if (n === 0) return [0, { 0: 1 }];
    if (n === 1) return basicPolys[name];
    if (mem[name] === undefined) mem[name] = [];
    while (mem[name].length < n - 1) {
      const len = mem[name].length;
      mem[name].push(
        karatsuba(
          basicPolys[name],
          len > 0 ? mem[name][len - 1] : basicPolys[name]
        )
      );
    }
    return mem[name][n - 2];
  };

  // Possible idea: stringify JSON and use it to store evalated products in a hash table
  // Only useful if multiplication is the problem

  const coeffToPolyMemoize = (c: Coeff): Poly => {
    let ret: Poly = [0, { 0: c[1] }];
    const update = (key: string) => {
      if (c[key] !== undefined && c[key] !== 0) {
        ret = karatsuba(ret, powMemoize(key, c[key]));
      }
    };
    update("c1");
    update("c2");
    update("c3");
    update("cUntwist1");
    update("cUntwist2");
    update("cUntwist1Circle");
    update("cUntwist2Circle");
    update("ihx2");
    update("ihx3");
    update("circle");
    update("c2x1");
    update("c3x1");
    update("c4x0");
    update("c4x1");
    update("c4x2");
    update("c5x0");
    update("c5x1");
    update("c5x2");
    update("c5x3");
    update("c5x4");
    update("c2x1Circle");
    return ret;
  };

  if (cs.length === 0) return [0, { 0: 0 }];
  let res = coeffToPolyMemoize(cs[0]);
  for (let i = 1; i < cs.length; i++) {
    res = dumbAdd(res, coeffToPolyMemoize(cs[i]));
  }
  return res;
}

// Adapted from https://en.wikipedia.org/wiki/Karatsuba_algorithm
// For this to split properly, PolyBase's must have minimal power >= 0
export function karatsuba(p1: Poly, p2: Poly): Poly {
  // Base case
  if (isConst(p1) || isConst(p2)) return dumbMult(p1, p2);

  // Normalise both p1,p2
  p1 = normalise(p1);
  p2 = normalise(p2);

  // Split the polynomials in half
  const mx = Math.max(
    ...Object.keys(p1[1]).map(Number),
    ...Object.keys(p2[1]).map(Number)
  );
  const mSplit = Math.ceil(mx / 2);

  // Forget the extra powers for a moment
  const [p1Low, p1High] = splitAt([0, p1[1]], mSplit);
  const [p2Low, p2High] = splitAt([0, p2[1]], mSplit);

  // Recursion
  const z0 = karatsuba(p1Low, p2Low);
  const z1 = karatsuba(dumbAdd(p1Low, p1High), dumbAdd(p2Low, p2High));
  const z2 = karatsuba(p1High, p2High);

  const res = dumbAdd(
    dumbAdd(
      [2 * mSplit + z2[0], z2[1]],
      dumbAdd(
        dumbAdd([mSplit + z1[0], z1[1]], dumbNeg([mSplit + z2[0], z2[1]])),
        dumbNeg([mSplit + z0[0], z0[1]])
      )
    ),
    z0
  );
  // (z2 * x^(2*mSplit)) + ((z1 - z2 - z0) * x^mSplit) + z0

  // Put back on the powers we forgot
  return [p1[0] + p2[0] + res[0], res[1]];
}

export function karatsubaPow(p: Poly, n: number): Poly {
  if (n < 0) throw Error("Error in karatsubaPow: n is negative");
  if (n === 0) return [0, { 0: 1 }];
  if (n === 1) return p;
  return karatsuba(p, karatsubaPow(p, n - 1));
}

export function polyProd(ps: Poly[]): Poly {
  if (ps.length === 0) return one();
  if (ps.length === 1) return ps[0];
  let res = ps[0];
  for (let i = 1; i < ps.length; i++) {
    res = karatsuba(res, ps[i]);
  }
  return res;
}
export function polySum(ps: Poly[]): Poly {
  if (ps.length === 0) return zero();
  if (ps.length === 1) return ps[0];
  let res = ps[0];
  for (let i = 1; i < ps.length; i++) {
    res = dumbAdd(res, ps[i]);
  }
  return res;
}

import fs from "fs";
import readline from "readline";
export function readCoeff(
  i: number,
  filename = "data/knot-eval--3-10.out"
): Promise<Coeff[]> {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(filename);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    let curLine = 0;
    let output: Coeff[];
    rl.on("line", (line) => {
      if (curLine === i) {
        output = JSON.parse(line);
        rl.close();
      }
      curLine++;
    })
      .on("close", () => {
        resolve(output);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
