import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#128a5b"/>
      <stop offset="100%" stop-color="#08472f"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.32"/>
    </filter>
  </defs>
  <!-- Background Squircle -->
  <rect width="512" height="512" rx="120" fill="url(#bg)"/>
  
  <!-- Outer subtle border -->
  <rect x="8" y="8" width="496" height="496" rx="112" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8"/>

  <!-- Shopping Cart Body -->
  <g filter="url(#shadow)">
    <!-- Wheels -->
    <circle cx="215" cy="405" r="30" fill="#ffffff"/>
    <circle cx="345" cy="405" r="30" fill="#ffffff"/>

    <!-- Basket frame -->
    <path d="M120 155 h 48 l 36 155 c 4 16 18 28 35 28 h 136 c 17 0 31 -12 35 -28 l 32 -135 H 176" 
          fill="none" 
          stroke="#ffffff" 
          stroke-width="32" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
          
    <!-- Checklist items inside cart -->
    <line x1="225" y1="220" x2="315" y2="220" stroke="rgba(255, 255, 255, 0.5)" stroke-width="18" stroke-linecap="round"/>
    <line x1="235" y1="268" x2="295" y2="268" stroke="rgba(255, 255, 255, 0.5)" stroke-width="18" stroke-linecap="round"/>
  </g>

  <!-- Golden Best-Price Check Badge -->
  <g filter="url(#shadow)">
    <circle cx="388" cy="128" r="66" fill="url(#gold)"/>
    <circle cx="388" cy="128" r="66" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.6"/>
    <!-- Checkmark inside badge -->
    <path d="M358 128 l 22 22 l 40 -42" 
          fill="none" 
          stroke="#08472f" 
          stroke-width="20" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
  </g>
</svg>`;

async function main() {
  const publicDir = path.resolve('public');
  const svgPath = path.join(publicDir, 'favicon.svg');
  fs.writeFileSync(svgPath, svgContent, 'utf-8');
  console.log('Saved favicon.svg');

  const svgBuffer = Buffer.from(svgContent);

  // Generate PNG sizes
  const p16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const p32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const p48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  const p180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  const p192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  const p512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), p16);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), p32);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), p180);
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), p192);
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), p512);

  // Pack multi-resolution .ico (16, 32, 48)
  const images = [
    { size: 16, buffer: p16 },
    { size: 32, buffer: p32 },
    { size: 48, buffer: p48 }
  ];

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(images.length, 4); // count

  const dirEntrySize = 16;
  const entries = [];
  let offset = 6 + images.length * dirEntrySize;

  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.size, 0); // width
    entry.writeUInt8(img.size, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset
    entries.push(entry);
    offset += img.buffer.length;
  }

  const icoBuffer = Buffer.concat([header, ...entries, ...images.map((i) => i.buffer)]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Saved favicon.ico and all PNG sizes!');
}

main().catch(console.error);
