/**
 * CRC-32/MPEG-2: poly 0x04C11DB7, init 0xFFFFFFFF, no reflection, no final XOR.
 * Table-driven, MSB first. Check value for "123456789" is 0x0376E6E7.
 */
const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i << 24;
    for (let k = 0; k < 8; k++) c = c & 0x80000000 ? (c << 1) ^ 0x04c11db7 : c << 1;
    t[i] = c >>> 0;
  }
  return t;
})();

export function crc32mpeg2(bytes: ArrayLike<number>): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = ((crc << 8) ^ TABLE[((crc >>> 24) ^ bytes[i]) & 0xff]) >>> 0;
  return crc >>> 0;
}
