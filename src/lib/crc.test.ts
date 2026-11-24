import { describe, expect, it } from "vitest";
import { crc32mpeg2 } from "./crc";

const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

describe("crc32mpeg2", () => {
  it("matches the catalogue check value", () => {
    expect(crc32mpeg2(ascii("123456789"))).toBe(0x0376e6e7);
  });
  it("is 0xFFFFFFFF for no input and changes with a single flipped bit", () => {
    expect(crc32mpeg2([])).toBe(0xffffffff);
    expect(crc32mpeg2([0x00])).not.toBe(crc32mpeg2([0x01]));
  });
  it("detects the frame when its CRC is appended (residue is zero)", () => {
    const data = ascii("radio frame");
    const c = crc32mpeg2(data);
    expect(crc32mpeg2([...data, c >>> 24, (c >>> 16) & 0xff, (c >>> 8) & 0xff, c & 0xff])).toBe(0);
  });
});
