/** Rough character width of the mono face at a given size, used to wrap labels inside SVG boxes. */
export const monoWidth = (size: number) => size * 0.66;

/** Wrap `text` into lines of at most `max` characters, breaking at spaces. */
export function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}
