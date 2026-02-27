import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceFile = path.resolve('src/assets/carama.png');
const publicDir = path.resolve('public');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

async function resizeImage(size, outputName, isIos = false) {
    const outputPath = path.join(publicDir, outputName);
    try {
        let transformer = sharp(sourceFile).resize(size, size, {
            fit: 'contain',
            background: { r: 13, g: 13, b: 13, alpha: 1 } // #0d0d0d matches theme
        });

        if (isIos) {
            // iOS doesn't support transparency well, so ensure background is solid
            transformer = transformer.flatten({ background: { r: 13, g: 13, b: 13 } });
        }

        await transformer.toFile(outputPath);
        console.log(`Generated ${outputName} (${size}x${size})`);
    } catch (error) {
        console.error(`Error generating ${outputName}:`, error);
    }
}

async function generateIcons() {
    if (!fs.existsSync(sourceFile)) {
        console.error(`Error: Source file not found at ${sourceFile}`);
        process.exit(1);
    }

    console.log('Generating PWA icons...');
    await resizeImage(192, 'icon-192x192.png');
    await resizeImage(512, 'icon-512x512.png');
    await resizeImage(180, 'apple-touch-icon.png', true);
    console.log('✅ All icons generated successfully!');
}

generateIcons();
