export function trimLines(lines: string[]): string[] {
  return lines.map((line) => line.trim()).filter((line) => !!line);
}
