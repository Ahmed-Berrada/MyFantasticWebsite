import { describe, expect, it } from "vitest";
import { crc32mpeg2 } from "./crc";
import { buildFrame } from "./radioframe";

describe("radio frame", () => {
  const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

  it("lays the fields end to end over every byte, in order", () => {
    for (const payload of [[], ascii("hi"), ascii("hello world!")]) {
      const f = buildFrame("you", 1047, payload);
      expect(f.fields[0].from).toBe(0);
      f.fields.forEach((field, i) => i > 0 && expect(field.from).toBe(f.fields[i - 1].to));
      expect(f.fields.at(-1)?.to).toBe(f.bytes.length);
      const p = f.fields.find((x) => x.id === "payload");
      expect(f.bytes.slice(p?.from, p?.to)).toEqual(payload);
    }
  });

  it("writes the UDP length of the whole datagram and the sequence number big-endian", () => {
    const f = buildFrame("CC", 0x0417, [1, 2, 3, 4, 5, 6]);
    expect((f.bytes[4] << 8) | f.bytes[5]).toBe(f.bytes.length);
    expect(f.bytes.slice(9, 11)).toEqual([0x04, 0x17]);
    expect(f.bytes[8]).toBe(0x21);
  });

  it("ends with the CRC-32/MPEG-2 of the message, big-endian", () => {
    const f = buildFrame("ZC", 7, ascii("123456789"));
    const message = f.bytes.slice(8, -4);
    expect(f.crc).toBe(crc32mpeg2(message));
    expect(f.bytes.slice(-4)).toEqual([f.crc >>> 24, (f.crc >>> 16) & 0xff, (f.crc >>> 8) & 0xff, f.crc & 0xff]);
    // CRC-32/MPEG-2 has no final XOR, so the message followed by its CRC leaves a zero remainder.
    expect(crc32mpeg2([...message, ...f.bytes.slice(-4)])).toBe(0);
  });

  it("changes the CRC completely when one payload byte changes", () => {
    const a = buildFrame("you", 1, ascii("hello")).crc;
    const b = buildFrame("you", 1, ascii("hellp")).crc;
    expect(a).not.toBe(b);
  });
});
