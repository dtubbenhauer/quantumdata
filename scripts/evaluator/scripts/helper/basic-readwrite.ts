import fs from "fs";

export function readLines(filename: string) {
  const file = fs.readFileSync(filename).toString().trimEnd();
  return file.length > 0 ? file.split("\n") : [];
}
export function writeLines(filename: string, lines: Array<string>) {
  return fs.writeFileSync(filename, lines.join("\n"));
}
export function appendLines(filename: string, lines: Array<string>) {
  return fs.appendFileSync(filename, lines.join("\n"));
}
