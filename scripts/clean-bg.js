const sharp = require('sharp');

async function createSeamlessBg() {
  const meta = await sharp('assets/original.jpg').metadata();
  console.log('Original size:', meta.width, meta.height);

  // We want to gently cover the central card content from x: 260 to 765, y: 15 to 545
  // with a feathered, seamless dark fill matching rgb(12, 12, 12) / rgb(8, 8, 8).
  // No hard edges!
  const svgOverlay = `
    <svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="seamlessGlow" cx="50%" cy="45%" r="45%">
          <stop offset="0%" stop-color="#0a0a0d" stop-opacity="1" />
          <stop offset="65%" stop-color="#090a0d" stop-opacity="0.98" />
          <stop offset="85%" stop-color="#0a090b" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#0c0c0c" stop-opacity="0" />
        </radialGradient>
        <filter id="bigBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="35" />
        </filter>
      </defs>
      
      <!-- Big soft feathered ellipse in the center covering all the old texts and lines -->
      <ellipse cx="512" cy="275" rx="255" ry="265" fill="url(#seamlessGlow)" filter="url(#bigBlur)" />
      <!-- Subtle inner core to guarantee 100% opacity over the old text -->
      <ellipse cx="512" cy="275" rx="220" ry="235" fill="#090a0c" filter="url(#bigBlur)" />
    </svg>
  `;

  await sharp('assets/original.jpg')
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .toFile('assets/bg-cleaned.jpg');

  console.log('Seamless bg-cleaned.jpg created successfully');
}

createSeamlessBg().catch(console.error);
