import fs from "fs";
import {
  readLines as readLinesBasic,
  writeLines,
} from "./helper/basic-readwrite";
import { readLines } from "./helper/large-readwrite";
import { range, max, sum } from "./helper/array-util";
import { createBar } from "./helper/bar";

const bar = createBar();

function nonzeroColumns(
  sparse: Array<{ [index: string]: number }>
): Array<number> {
  return [
    ...new Set(sparse.map((d) => Object.keys(d).map(Number)).flat()),
  ].toSorted((a, b) => a - b);
}

const type = "a2";
readLines(`../../knot-${type}-16-dict.out`)
// readLines(`../../knot-${type}-3-16-dict.out`)
  .then((lines) => lines.filter((line) => line.length > 0))
  .then((sixteen) => {
    const dicts = [
      ...readLinesBasic(`../../knot-${type}-3-10-dict.out`),
      ...readLinesBasic(`../../knot-${type}-11-dict.out`),
      ...readLinesBasic(`../../knot-${type}-12-dict.out`),
      ...readLinesBasic(`../../knot-${type}-13-dict.out`),
      ...readLinesBasic(`../../knot-${type}-14-dict.out`),
      ...readLinesBasic(`../../knot-${type}-15-dict.out`),
      ...readLinesBasic(`../../knot-${type}-16-dict.out`),
      ...sixteen,
    ].map((line) => JSON.parse(line));

    console.log(dicts.length);
    // console.log(dicts.slice(0, 10));

    // ============================== One variable ==============================

    // // // Calculating max degree
    const maxDegree = max(
      dicts.map((d) => max(Object.keys(d).map((k) => Math.abs(+k))))
    );
    // const maxDegree = 45;
    console.log(maxDegree);

    const sparse = dicts;

    // ============================== END One variable ==============================
    // ============================== Two variable ==============================

    // function getSparseVector2(
    //   dict: { [powers: string]: number },
    //   maxDeg0: number,
    //   maxDeg1: number
    // ): { [index: string]: number } {
    //   // const ret: Array<[number, number]> = [];
    //   // for (let i = 0; i <= 2 * maxDeg0; i++) {
    //   //   for (let j = 0; j <= 2 * maxDeg1; j++) {
    //   //     const xDeg = i - maxDeg0;
    //   //     const yDeg = j - maxDeg1;
    //   //     const index = i * (2 * maxDeg1 + 1) + j;
    //   //     if (dict[`${xDeg},${yDeg}`] !== undefined) {
    //   //       ret.push([index, dict[`${xDeg},${yDeg}`]]);
    //   //     }
    //   //   }
    //   // }
    //   const ret: { [index: string]: number } = {};
    //   Object.keys(dict).forEach((k) => {
    //     const [xDeg, yDeg] = k.split(",").map(Number);
    //     const i = xDeg + maxDeg0;
    //     const j = yDeg + maxDeg1;
    //     const index = i * (2 * maxDeg1 + 1) + j;
    //     ret[index] = dict[k];
    //   });
    //   return ret;
    // }
    // console.log(dicts.length);
    // // console.log(dicts.slice(0, 10));

    // // // Calculate max degrees
    // const maxDegree0 = max(
    //   dicts.map((d) => max(Object.keys(d).map((k) => Math.abs(+k.split(",")[0]))))
    // );
    // // const maxDegree0 = 45;
    // const maxDegree1 = max(
    //   dicts.map((d) => max(Object.keys(d).map((k) => Math.abs(+k.split(",")[1]))))
    // );
    // // const maxDegree1 = 16;

    // console.log(maxDegree0);
    // console.log(maxDegree1);

    // // // Calculating sparse rows (only needed to put 2-variables into 1-variable)
    // console.log("Calculating sparse rows");
    // bar.start(dicts.length, 1);
    // const sparse: Array<{ [index: string]: number }> = [];
    // for (let i = 0; i < dicts.length; i++) {
    //   sparse.push(getSparseVector2(dicts[i], maxDegree0, maxDegree1));
    //   bar.increment();
    // }
    // bar.stop();

    // ============================== END Two variable ==============================

    // // Find all the ones that are all zero
    console.log("Find nonzeros");
    // const columns = nonzeroColumns(sparse); // actual nonzeros (for both)
    // columns.forEach((n) => console.log(n));
    const columns = range(-maxDegree, maxDegree + 1); // all of them (for 1-var)

    // For Khovanov 16 (precalculated)
    // const nonzeros: Array<number> = [
    //   133, 199, 200, 265, 266, 267, 331, 332, 333, 334, 397, 398, 399, 400, 401,
    //   464, 465, 466, 467, 468, 530, 531, 532, 533, 534, 535, 597, 598, 599, 600,
    //   601, 602, 664, 665, 666, 667, 668, 669, 730, 731, 732, 733, 734, 735, 736,
    //   737, 797, 798, 799, 800, 801, 802, 803, 864, 865, 866, 867, 868, 869, 870,
    //   871, 930, 931, 932, 933, 934, 935, 936, 937, 997, 998, 999, 1000, 1001, 1002,
    //   1003, 1004, 1064, 1065, 1066, 1067, 1068, 1069, 1070, 1071, 1072, 1130, 1131,
    //   1132, 1133, 1134, 1135, 1136, 1137, 1138, 1197, 1198, 1199, 1200, 1201, 1202,
    //   1203, 1204, 1205, 1264, 1265, 1266, 1267, 1268, 1269, 1270, 1271, 1272, 1330,
    //   1331, 1332, 1333, 1334, 1335, 1336, 1337, 1338, 1397, 1398, 1399, 1400, 1401,
    //   1402, 1403, 1404, 1405, 1463, 1464, 1465, 1466, 1467, 1468, 1469, 1470, 1471,
    //   1472, 1489, 1490, 1491, 1492, 1493, 1494, 1495, 1496, 1497, 1498, 1499, 1500,
    //   1501, 1502, 1530, 1531, 1532, 1533, 1534, 1535, 1536, 1537, 1538, 1556, 1557,
    //   1558, 1559, 1560, 1561, 1562, 1563, 1564, 1565, 1566, 1567, 1568, 1569, 1597,
    //   1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1622, 1623, 1624, 1625, 1626,
    //   1627, 1628, 1629, 1630, 1631, 1632, 1633, 1634, 1635, 1636, 1663, 1664, 1665,
    //   1666, 1667, 1668, 1669, 1670, 1671, 1672, 1689, 1690, 1691, 1692, 1693, 1694,
    //   1695, 1696, 1697, 1698, 1699, 1700, 1701, 1702, 1703, 1730, 1731, 1732, 1733,
    //   1734, 1735, 1736, 1737, 1738, 1739, 1756, 1757, 1758, 1759, 1760, 1761, 1762,
    //   1763, 1764, 1765, 1766, 1767, 1768, 1769, 1770, 1771, 1797, 1798, 1799, 1800,
    //   1801, 1802, 1803, 1804, 1805, 1823, 1824, 1825, 1826, 1827, 1828, 1829, 1830,
    //   1831, 1832, 1833, 1834, 1835, 1836, 1837, 1838, 1863, 1864, 1865, 1866, 1867,
    //   1868, 1869, 1870, 1871, 1872, 1890, 1891, 1892, 1893, 1894, 1895, 1896, 1897,
    //   1898, 1899, 1900, 1901, 1902, 1903, 1904, 1905, 1930, 1931, 1932, 1933, 1934,
    //   1935, 1936, 1937, 1938, 1939, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964,
    //   1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1996, 1997, 1998, 1999, 2000,
    //   2001, 2002, 2003, 2004, 2005, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031,
    //   2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2064, 2065, 2066, 2067, 2068,
    //   2069, 2070, 2071, 2072, 2091, 2092, 2093, 2094, 2095, 2096, 2097, 2098, 2099,
    //   2100, 2101, 2102, 2103, 2104, 2105, 2106, 2131, 2132, 2133, 2134, 2135, 2136,
    //   2137, 2138, 2139, 2158, 2159, 2160, 2161, 2162, 2163, 2164, 2165, 2166, 2167,
    //   2168, 2169, 2170, 2171, 2172, 2173, 2197, 2198, 2199, 2200, 2201, 2202, 2203,
    //   2204, 2205, 2226, 2227, 2228, 2229, 2230, 2231, 2232, 2233, 2234, 2235, 2236,
    //   2237, 2238, 2239, 2265, 2266, 2267, 2268, 2269, 2270, 2271, 2272, 2293, 2294,
    //   2295, 2296, 2297, 2298, 2299, 2300, 2301, 2302, 2303, 2304, 2305, 2306, 2331,
    //   2332, 2333, 2334, 2335, 2336, 2337, 2338, 2339, 2360, 2361, 2362, 2363, 2364,
    //   2365, 2366, 2367, 2368, 2369, 2370, 2371, 2372, 2399, 2400, 2401, 2402, 2403,
    //   2404, 2405, 2427, 2428, 2429, 2430, 2431, 2432, 2433, 2434, 2435, 2436, 2438,
    //   2465, 2466, 2467, 2468, 2469, 2470, 2471, 2472, 2533, 2534, 2535, 2536, 2537,
    //   2538, 2599, 2600, 2601, 2602, 2603, 2604, 2605, 2667, 2668, 2669, 2670, 2671,
    //   2733, 2734, 2735, 2736, 2737, 2738, 2801, 2802, 2803, 2804, 2867, 2868, 2869,
    //   2870, 2935, 2936, 3001, 3002,
    // ];

    // // // Calculating lines
    console.log("Calculating lines");
    bar.start(dicts.length, 0);
    const lines = [];
    for (let i = 0; i < sparse.length; i++) {
      lines.push(
        columns
          .map((index) =>
            sparse[i][index] === undefined ? "0" : String(sparse[i][index])
          )
          .join(",")
      );
      bar.increment();
    }
    bar.stop();

    // // Write
    console.log("Writing file");
    bar.start(lines.length, 0);
    for (let i = 0; i < lines.length; i++) {
      fs.appendFileSync(`../../knot-${type}-3-16-vect.out`, `${lines[i]}\n`);
      // fs.appendFileSync(`../../knot-${type}-3-16-trimmedvect.out`, `${lines[i]}\n`);
      bar.increment();
    }
    bar.stop();
  });
