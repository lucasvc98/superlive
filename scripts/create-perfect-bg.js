const sharp = require('sharp');

async function createPerfectBg() {
  const meta = await sharp('assets/original.jpg').metadata();
  
  // The card bottom is at y=535. The bottom rocks start around y=520-530.
  // We can fade out vertically at the bottom so the rocks and subtle lava glow remain natural.
  const svgOverlay = `
    <svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Horizontal fade from sides -->
        <linearGradient id="hFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#08090c" stop-opacity="0" />
          <stop offset="6%" stop-color="#08090c" stop-opacity="0.95" />
          <stop offset="12%" stop-color="#08090c" stop-opacity="1" />
          <stop offset="88%" stop-color="#08090c" stop-opacity="1" />
          <stop offset="94%" stop-color="#08090c" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#08090c" stop-opacity="0" />
        </linearGradient>
        
        <!-- Bottom atmospheric glow to seamlessly blend with bottom volcanic terrain -->
        <linearGradient id="bottomAtmosphere" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#08090c" stop-opacity="1" />
          <stop offset="85%" stop-color="#08090c" stop-opacity="0.95" />
          <stop offset="94%" stop-color="#120904" stop-opacity="0.7" />
          <stop offset="100%" stop-color="#1a0b04" stop-opacity="0" />
        </linearGradient>
      </defs>
      
      <!-- Center dark mask covering the old card -->
      <rect x="250" y="0" width="524" height="${meta.height - 30}" fill="url(#hFade)" />
      <rect x="260" y="0" width="504" height="${meta.height}" fill="url(#bottomAtmosphere)" opacity="0.9" />
    </svg>
  `;

  await sharp('assets/original.jpg')
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .toFile('assets/bg-perfect.jpg');

  console.log('bg-perfect.jpg with bottom terrain updated successfully');
}

createPerfectBg().catch(console.error);
