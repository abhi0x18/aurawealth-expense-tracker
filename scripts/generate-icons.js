const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPng(width, height, colorGen) {
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = colorGen(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  function createChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // non-interlaced

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation
function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

// Emerald & Gold App Icon Generator
function auraWealthColor(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w * 0.5);
  const dy = (y - cy) / (h * 0.5);
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Rounded squircle mask
  if (Math.abs(dx) > 0.95 || Math.abs(dy) > 0.95) {
    return [0, 0, 0, 0];
  }

  // Gold border
  if (dist > 0.88 && dist < 0.94) {
    return [245, 209, 108, 255]; // Gold accent border
  }

  // Inner shield emblem diamond
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  if (adx + ady < 0.5) {
    // Center gold/emerald core
    if (adx < 0.12 && ady < 0.3) {
      return [255, 225, 120, 255]; // Vertical dollar bar gold
    }
    return [16, 185, 129, 255]; // Emerald core
  }

  // Dark luxury gradient
  const grad = Math.min(1, Math.max(0, dist));
  const r = Math.round(7 + grad * 12);
  const g = Math.round(18 + (1 - grad) * 22);
  const b = Math.round(12 + grad * 8);

  return [r, g, b, 255];
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'icon-192.png'), createPng(192, 192, auraWealthColor));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), createPng(512, 512, auraWealthColor));
console.log('App icons generated successfully in public/icons!');
