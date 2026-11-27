import { crc32mpeg2 } from "./crc";

/** Illustrative radio frame for the Siemens demo. Not the real protocol: the layout is invented, the CRC is real. */
export type Source = "CC" | "ZC" | "WRG" | "you";
export type FieldId = "srcPort" | "dstPort" | "length" | "udpSum" | "type" | "seq" | "payload" | "crc";

export interface Frame {
  source: Source;
  type: number;
  seq: number;
  payload: number[];
  bytes: number[];
  crc: number;
  fields: { id: FieldId; from: number; to: number }[];
}

const CODE: Record<Source, number> = { CC: 0x21, ZC: 0x42, WRG: 0x13, you: 0x7e };

/** UDP header + illustrative message (type, seq, payload) + CRC-32/MPEG-2 over the message. */
export function buildFrame(source: Source, seq: number, payload: number[]): Frame {
  const type = CODE[source];
  const message = [type, (seq >> 8) & 0xff, seq & 0xff, ...payload];
  const crc = crc32mpeg2(message);
  const udpLen = 8 + message.length + 4;
  const header = [0xc3, 0x51, 0xc3, 0x52, (udpLen >> 8) & 0xff, udpLen & 0xff, 0x00, 0x00];
  const bytes = [...header, ...message, crc >>> 24, (crc >>> 16) & 0xff, (crc >>> 8) & 0xff, crc & 0xff];
  const p0 = 11;
  return {
    source,
    type,
    seq,
    payload,
    bytes,
    crc,
    fields: [
      { id: "srcPort", from: 0, to: 2 },
      { id: "dstPort", from: 2, to: 4 },
      { id: "length", from: 4, to: 6 },
      { id: "udpSum", from: 6, to: 8 },
      { id: "type", from: 8, to: 9 },
      { id: "seq", from: 9, to: 11 },
      { id: "payload", from: p0, to: p0 + payload.length },
      { id: "crc", from: p0 + payload.length, to: p0 + payload.length + 4 },
    ],
  };
}
