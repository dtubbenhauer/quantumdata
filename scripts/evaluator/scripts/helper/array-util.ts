// --------------------- Array creation ---------------------
export function range(start: number, end: number) {
  return [...Array(end - start).keys()].map((i) => i + start);
}

// Fast fill with zeros
export function zeros(n: number) {
  if (n <= 0) {
    return [];
  }
  let arr: Array<number>;
  (arr = []).length = n;
  arr.fill(0);
  return arr;
}
export function zeros2(x: number, y: number) {
  if (x < 0 || y < 0) {
    return [];
  }
  let arr: Array<Array<number>>;
  (arr = []).length = x;
  for (let i = 0; i < x; i++) {
    arr[i] = zeros(y);
  }
  return arr;
}

// --------------------- Accumulation ---------------------

// Math.max dies for large arrays, we use this instead
// https://stackoverflow.com/questions/42623071/maximum-call-stack-size-exceeded-with-math-min-and-math-max
export function max(arr: Array<number>) {
  let len = arr.length;
  let max = -Infinity;

  while (len--) {
    max = arr[len] > max ? arr[len] : max;
  }
  return max;
}

export function min(arr: Array<number>) {
  let len = arr.length;
  let min = Infinity;

  while (len--) {
    min = arr[len] < min ? arr[len] : min;
  }
  return min;
}

export function sum(list: Array<number>) {
  return list.reduce((a, b) => a + b, 0);
}
