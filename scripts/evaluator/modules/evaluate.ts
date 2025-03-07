/**************** Evaluate graphs *****************/

// can take non-planar graphs
export default function evaluateGraph(g: Array<[number, number]>): number {
  let value = 1;
  // Connected components
  const components = getConnectedComponents(g);
  for (let i = 0; i < components.length; i++) {
    value *= evaluateGraphConnected(components[i]);
    if (value === 0) return 0;
  }
  return value;
}

// Function for connected graphs
export function evaluateGraphConnected(g: Array<[number, number]>): number {
  // if (isZero(g)) return 0; // checking this takes a lot of time!

  // Pick the smallest cycle and look at not-in-cycle neighbours
  const cycle = getShortestCycle(g);
  const vs = getOtherNbrs(g, cycle).flat();

  if (cycle.length === 1) {
    return 0;
  } else if (cycle.length === 2) {
    // Bigon
    if (vs.length === 0) {
      // Triple multiedge (vs.length === 0)
      return 2 * 3;
    } else {
      // Double multiedge (vs.length === 2)
      const g1 = seq(g, [removeVs(cycle), connectV(vs[0], vs[1])]);
      // return 2 * evaluateGraph(g1);
      return 2 * evaluateGraphConnected(g1);
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
    return evaluateGraphConnected(g1);
  } else if (cycle.length === 4) {
    // Square (vs.length === 4)
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
    return evaluateGraph(g1) + evaluateGraph(g2);
  } else if (cycle.length === 5) {
    // Pentagon (vs.length === 5)
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
    return (
      evaluateGraph(g1) +
      evaluateGraph(g2) +
      evaluateGraph(g3) -
      evaluateGraph(g4)
    );
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
    return evaluateGraph(g1) + evaluateGraph(g2) - evaluateGraph(g3);
  }
}

export function isZero(g: Array<[number, number]>): boolean {
  if (hasLoop(g)) return true; // easy check first
  return getConnectedComponents(g).some((g) => g.some((e) => isCutEdge(e, g)));
}

/**************** Recursion depth of evaluation I=H (w/o other terms) *****************/
// Taking max of disjoint components
export function evaluateGraph2(g: Array<[number, number]>): number {
  let value = 1;
  // Connected components
  const components = getConnectedComponents(g);
  for (let i = 0; i < components.length; i++) {
    value = Math.max(value, evaluateGraphConnected2(components[i]));
  }
  return value;
}
// Counts the depth of the H branch in I=H relation
export function evaluateGraphConnected2(g: Array<[number, number]>): number {
  // Pick the smallest cycle and look at not-in-cycle neighbours
  const cycle = getShortestCycle(g);
  const vs = getOtherNbrs(g, cycle).flat();

  console.log(g);
  if (cycle.length === 1) {
    return 1;
  } else if (cycle.length === 2) {
    return 2;
  } else if (cycle.length === 3) {
    return 3;
  } else {
    const g1 = seq(g, [
      removeVs([cycle[1], cycle[2]]),
      connectV(cycle[1], cycle[0]),
      connectV(cycle[1], cycle[3]),
      connectV(cycle[1], cycle[2]),
      connectV(cycle[2], vs[1]),
      connectV(cycle[2], vs[2]),
    ]);
    return evaluateGraph2(g1) + 1;
  }
}

/**************************************************/
// Graph functions

export function eEq(e1: [number, number], e2: [number, number]) {
  return (
    (e1[0] === e2[0] && e1[1] === e2[1]) || (e1[0] === e2[1] && e1[1] === e2[0])
  );
}

export function eGt(e1: [number, number], e2: [number, number]) {
  const mn1 = e1[0] > e1[1] ? e1[1] : e1[0];
  const mx1 = e1[0] > e1[1] ? e1[0] : e1[1];
  const mn2 = e2[0] > e2[1] ? e2[1] : e2[0];
  const mx2 = e2[0] > e2[1] ? e2[0] : e2[1];
  if (mn1 > mn2) return 1;
  if (mn1 < mn2) return -1;
  if (mx1 > mx2) return 1;
  if (mx1 < mx2) return -1;
  return -1;
}

export function getVs(g: Array<[number, number]>) {
  return [...new Set(g.flat())];
}

export function getNbrs(
  g: Array<[number, number]>,
  v: number,
  unique: boolean = false
) {
  const n = g
    .filter((e) => e[0] === v || e[1] === v)
    .map((e) => (e[0] === v ? e[1] : e[0]));
  return !unique ? n : [...new Set(n)];
}

export function getOtherNbrs(g: Array<[number, number]>, vs: Array<number>) {
  return vs.map((v) => getNbrs(g, v).filter((w) => !vs.includes(w)));
}

export const removeV =
  (v: number) =>
  (g: Array<[number, number]>): Array<[number, number]> =>
    g.filter((e) => e[0] !== v && e[1] !== v);

export const removeVs =
  (vs: Array<number>) =>
  (g: Array<[number, number]>): Array<[number, number]> =>
    g.filter((e) => !vs.includes(e[0]) && !vs.includes(e[1]));

export const connectV =
  (v1: number, v2: number) =>
  (g: Array<[number, number]>): Array<[number, number]> =>
    [...g, [v1, v2]];

export function hasLoop(g: Array<[number, number]>): boolean {
  return g.some((e) => e[0] === e[1]);
}

export function hasMultiedge(g: Array<[number, number]>): boolean {
  return g.some((e) => g.filter((f) => eEq(e, f)).length >= 2);
}

// Graph g must be connected for this to make sense
export function isCutEdge(
  e: [number, number],
  g: Array<[number, number]>
): boolean {
  // parallel edges can't be cut edges (remove parallel edges before running for better results)
  if (g.filter((f) => f[0] === e[0] && f[1] === e[1]).length >= 2) return false;
  return !isConnected(g.filter((f) => f[0] !== e[0] || f[1] !== e[1]));
}

export function getConnectedComponents(
  g: Array<[number, number]>
): Array<Array<[number, number]>> {
  if (g.length === 0) return [];

  // BFS to find all reachable from one vertex
  const v = g[0][0]; // pick a vertex to start from
  const visited: { [vertex: number]: boolean } = { [v]: true };
  const queue: Array<number> = [v];
  while (queue.length > 0) {
    const cur = queue.shift() as number; // definitely not undefined
    getNbrs(g, cur, true).forEach((w) => {
      if (!visited[w]) {
        visited[w] = true;
        queue.push(w);
      }
    });
  }
  // Split off component (all edges must have both ends visited or not)
  // const [component, rest] = bifilter(g, ([u, _]) => visited[u]); // slow
  const component: Array<[number, number]> = [];
  const rest: Array<[number, number]> = [];
  for (let i = 0; i < g.length; i++) {
    if (visited[g[i][0]]) {
      component.push(g[i]);
    } else {
      rest.push(g[i]);
    }
  }

  return [component, ...getConnectedComponents(rest)];
}

export function isConnected(g: Array<[number, number]>): boolean {
  // Just a BFS from one vertex
  const v = g[0][0]; // pick a vertex to start from
  const visited: { [vertex: number]: boolean } = { [v]: true };
  const queue: Array<number> = [v];
  while (queue.length > 0) {
    const cur = queue.shift() as number; // definitely not undefined
    getNbrs(g, cur, true).forEach((w) => {
      if (!visited[w]) {
        visited[w] = true;
        queue.push(w);
      }
    });
  }
  // Check if connected component of edge is same as whole graph
  return Object.keys(visited).length === getVs(g).length;
}

// Shortest cycle for "looped multigraphs", can return loops or bigons from multiedges
// Requires the graph is connected
export function getShortestCycle(g: Array<[number, number]>): Array<number> {
  if (g.length === 0) return [];

  // loops
  const loops = g.filter((e) => e[0] === e[1]);
  if (loops.length > 0) return [loops[0][0]];

  // multiedges
  const multiedges = g.filter((e) => g.filter((f) => eEq(e, f)).length >= 2);
  if (multiedges.length > 0) return multiedges[0];

  // other cycles
  const vs = getVs(g);
  const cycles: Array<Array<number>> = [];
  // BFS until you see self
  // (basically modified unweighted Dijkstra, https://stackoverflow.com/questions/8379785/how-does-a-breadth-first-search-work-when-looking-for-shortest-path#comment27820665_8379892)
  for (const v of vs) {
    const visited: { [vertex: number]: boolean } = {};
    const parent: { [vertex: number]: number } = { [v]: NaN };
    const queue: Array<number> = [v];

    const getPath = (u: number): Array<number> => {
      const path: Array<number> = [];
      let cur = u;
      while (cur !== v) {
        path.push(cur);
        cur = parent[cur];
      }
      return path;
    };

    let minCycle: Array<number> | undefined = undefined;
    while (queue.length > 0) {
      const cur = queue.shift() as number; // definitely not undefined
      visited[cur] = true;
      getNbrs(g, cur, true).forEach((w) => {
        if (w === parent[cur]) return;
        if (!visited[w]) {
          queue.push(w);
          parent[w] = cur;
        } else {
          // Found a cycle
          const cycle = [v, ...getPath(cur).reverse(), ...getPath(w)];
          if (minCycle === undefined || cycle.length < minCycle.length) {
            minCycle = cycle;
          }
        }
      });
    }
    if (minCycle !== undefined) {
      if ((minCycle as number[]).length === 3) {
        return minCycle;
      }
      cycles.push(minCycle);
    }
  }

  return cycles.reduce((min, a) => (min.length > a.length ? a : min));
}

// Shortest cycle for "looped multigraphs", can return loops or bigons from multiedges
export function getShortestCycleBounded(
  g: Array<[number, number]>,
  bound: number
): Array<number> {
  if (g.length === 0) return [];

  // loops
  if (bound < 1) return []; // bound
  const loops = g.filter((e) => e[0] === e[1]);
  if (loops.length > 0) return [loops[0][0]];

  // multiedges
  if (bound < 2) return []; // bound
  const multiedges = g.filter((e) => g.filter((f) => eEq(e, f)).length >= 2);
  if (multiedges.length > 0) return multiedges[0];

  // other cycles
  if (bound < 3) return []; // bound
  const vs = getVs(g);
  const cycles: Array<Array<number>> = [];
  for (const v of vs) {
    // BFS until you see self
    // (basically modified unweighted Dijkstra, https://stackoverflow.com/questions/8379785/how-does-a-breadth-first-search-work-when-looking-for-shortest-path#comment27820665_8379892)
    const visited: { [vertex: number]: boolean } = {};
    const parent: { [vertex: number]: number } = { [v]: NaN };
    const queue: Array<[number, number]> = [[v, 0]];

    const getPath = (u: number): Array<number> => {
      const path: Array<number> = [];
      let cur = u;
      while (cur !== v) {
        path.push(cur);
        cur = parent[cur];
      }
      return path;
    };

    let minCycle: Array<number> | undefined = undefined;
    while (queue.length > 0) {
      const [cur, dist] = queue.shift() as [number, number]; // definitely not undefined
      if (dist >= bound) break;
      visited[cur] = true;
      getNbrs(g, cur, true).forEach((w) => {
        if (w === parent[cur]) return;
        if (!visited[w]) {
          queue.push([w, dist + 1]);
          parent[w] = cur;
        } else {
          // Found a cycle
          const cycle = [v, ...getPath(cur).toReversed(), ...getPath(w)];
          if (minCycle === undefined || cycle.length < minCycle.length) {
            minCycle = cycle;
          }
        }
      });
    }
    if (minCycle !== undefined) {
      if ((minCycle as number[]).length === 3) {
        return minCycle;
      }
      cycles.push(minCycle);
    }
  }

  return cycles.length > 0
    ? cycles.reduce((min, a) => (min.length > a.length ? a : min))
    : [];
}

/**************************************************/
// Helper

// Split array into pieces via function
// https://stackoverflow.com/questions/38860643/split-array-into-two-different-arrays-using-functional-javascript
// export const collateBy =
//   <T, K, V>(f: (x: T) => K) =>
//   (g: (acc: V, x: T) => V) =>
//   (xs: Array<T>) => {
//     return xs.reduce((m, x) => {
//       let v = f(x);
//       return m.set(v, g(m.get(v), x));
//     }, new Map());
//   };
// export const bifilter = <T>(
//   xs: Array<T>,
//   f: (x: T, i?: number, arr?: Array<T>) => boolean
// ) => {
//   return xs.reduce(
//     ([T, F], x, i, arr): [Array<T>, Array<T>] => {
//       if (f(x, i, arr) === true) return [[...T, x], F];
//       else return [T, [...F, x]];
//     },
//     [[], []] as [Array<T>, Array<T>]
//   );
// };

// Sequentially runs a list of functions `fs` on an input `x`
export const seq = <T>(x: T, fs: Array<(x: T) => T>) => {
  fs.forEach((f) => (x = f(x)));
  return x;
};

// export const replaceFirst = <T>(
//   arr: Array<T>,
//   match: (x: T) => boolean,
//   replace: T
// ): Array<T> =>
//   arr.reduce(
//     ([b, acc], x: T) =>
//       b
//         ? ([true, [...acc, x]] as [boolean, Array<T>])
//         : match(x)
//         ? ([true, [...acc, replace]] as [boolean, Array<T>])
//         : ([false, [...acc, x]] as [boolean, Array<T>]),
//     [false, []] as [boolean, Array<T>]
//   )[1];
// export const removeFirst = <T>(
//   arr: Array<T>,
//   match: (x: T) => boolean
// ): Array<T> =>
//   arr.reduce(
//     ([b, acc], x: T) =>
//       b
//         ? ([true, [...acc, x]] as [boolean, Array<T>])
//         : match(x)
//         ? ([true, acc] as [boolean, Array<T>])
//         : ([false, [...acc, x]] as [boolean, Array<T>]),
//     [false, []] as [boolean, Array<T>]
//   )[1];
