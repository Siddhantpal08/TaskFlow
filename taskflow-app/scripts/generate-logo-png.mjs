/**
 * generate-logo-png.mjs — ESM version
 * Run: node scripts/generate-logo-png.mjs
 */

import { createRequire } from 'module';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '../public');

async function getSharp() {
    try {
        const { default: s } = await import('sharp');
        return s;
    } catch {
        console.log('sharp not found — installing...');
        execSync('npm install sharp', { cwd: resolve(__dirname, '..'), stdio: 'inherit' });
        const { default: s } = await import('sharp');
        return s;
    }
}

async function main() {
    const sharp = await getSharp();

    const jobs = [
        { svg: 'logo.svg', png: 'logo.png', w: 512, h: 512 },
        { svg: 'logo.svg', png: 'logo@2x.png', w: 1024, h: 1024 },
        { svg: 'logo-wordmark.svg', png: 'logo-wordmark.png', w: 1200, h: 400 },
        { svg: 'favicon.svg', png: 'favicon.png', w: 32, h: 32 },
    ];

    for (const { svg, png, w, h } of jobs) {
        const svgPath = join(PUBLIC, svg);
        const pngPath = join(PUBLIC, png);
        if (!existsSync(svgPath)) { console.error(`Missing: ${svgPath}`); continue; }
        await sharp(svgPath).resize(w, h).png({ quality: 100 }).toFile(pngPath);
        console.log(`✅  ${png}  (${w}×${h})`);
    }

    // Copy PNGs to other project directories
    const { default: sh } = await import('sharp');  // already cached
    const copies = [
        ['logo.png', '../../taskflow-mobile/assets/logo.png'],
        ['logo-wordmark.png', '../../taskflow-mobile/assets/logo-wordmark.png'],
        ['logo.png', '../../logo.png'],
        ['logo-wordmark.png', '../../logo-wordmark.png'],
        ['logo.png', '../src/assets/logo.png'],
        ['logo-wordmark.png', '../src/assets/logo-wordmark.png'],
    ];

    for (const [src, rel] of copies) {
        const srcPath = join(PUBLIC, src);
        const dstPath = resolve(__dirname, '../', rel);
        if (!existsSync(srcPath)) continue;
        try {
            const { copyFileSync } = await import('fs');
            const dstDir = dstPath.substring(0, dstPath.lastIndexOf('/') !== -1 ? dstPath.lastIndexOf('/') : dstPath.lastIndexOf('\\'));
            mkdirSync(dstDir, { recursive: true });
            copyFileSync(srcPath, dstPath);
            console.log(`  ↳  copied to ${rel.replace('../..', 'project root').replace('..', 'frontend')}`);
        } catch (e) {
            console.log(`  ⚠  could not copy to ${rel}: ${e.message}`);
        }
    }

    console.log('\nAll logo PNGs generated and distributed!');
}

main().catch(console.error);
