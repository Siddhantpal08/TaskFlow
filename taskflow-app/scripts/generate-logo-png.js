/**
 * generate-logo-png.js
 * Converts TaskFlow SVG logos to PNG files using sharp (or node-canvas fallback)
 * Run: node scripts/generate-logo-png.js
 */

const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '../public');

// Check if sharp is available
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    sharp = null;
}

async function svgToPng(svgFile, pngFile, width, height) {
    const svgPath = path.join(OUT, svgFile);
    const pngPath = path.join(OUT, pngFile);

    if (!fs.existsSync(svgPath)) {
        console.error(`SVG not found: ${svgPath}`);
        return;
    }

    if (sharp) {
        await sharp(svgPath).resize(width, height).png().toFile(pngPath);
        console.log(`✅  ${pngFile}  (${width}×${height}) via sharp`);
    } else {
        // Fallback: just copy SVG content and rename — user can open in browser and save as PNG
        console.log(`⚠️  sharp not available. Run: npm install -g sharp`);
        console.log(`    Then re-run this script. Or open ${svgPath} in a browser`);
        console.log(`    and use File → Save As → PNG.`);
    }
}

async function main() {
    if (!sharp) {
        console.log('Installing sharp...');
        const { execSync } = require('child_process');
        try {
            execSync('npm install sharp --save-dev', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
            sharp = require('sharp');
        } catch (e) {
            console.error('Could not install sharp. Please run: npm install sharp');
            process.exit(1);
        }
    }

    await svgToPng('logo.svg', 'logo.png', 512, 512);
    await svgToPng('logo-wordmark.svg', 'logo-wordmark.png', 1200, 400);
    await svgToPng('logo.svg', 'logo@2x.png', 1024, 1024);
    await svgToPng('favicon.svg', 'favicon.png', 32, 32);

    console.log('\nDone! PNG files are in taskflow-app/public/');
}

main().catch(console.error);
