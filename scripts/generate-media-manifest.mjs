import fs from 'fs/promises';
import path from 'path';

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const DATA_FILES = [
  'public/data/projects.json',
  'public/data/achievements.json'
];

async function listImageFiles(dirPath) {
  try {
    const fullPath = path.join(PUBLIC_DIR, dirPath);
    const files = await fs.readdir(fullPath);
    return files
      .filter(file => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file))
      .map(file => path.join(dirPath, file).replace(/\\/g, '/'));
  } catch (error) {
    console.warn(`⚠️ Could not read directory: ${dirPath}. Error: ${error.message}`);
    return [];
  }
}

async function processDataFile(filePath) {
  console.log(`Processing ${filePath}...`);
  const absolutePath = path.resolve(process.cwd(), filePath);
  const fileContent = await fs.readFile(absolutePath, 'utf-8');
  const data = JSON.parse(fileContent);

  const key = path.basename(filePath, '.json'); // 'projects' or 'achievements'
  if (!data[key]) {
    console.warn(`No top-level key '${key}' found in ${filePath}. Skipping.`);
    return;
  }

  for (const item of data[key]) {
    if (item.media && Array.isArray(item.media)) {
      for (let i = 0; i < item.media.length; i++) {
        const mediaItem = item.media[i];
        if (mediaItem.type === 'gallery' && typeof mediaItem.src === 'string') {
          console.log(`  - Found gallery for "${item.title}": ${mediaItem.src}`);
          const imagePaths = await listImageFiles(mediaItem.src);
          
          // Sort images naturally (e.g., 1.png, 2.png, 10.png)
          imagePaths.sort((a, b) => {
            const numA = parseInt(path.basename(a).match(/(\d+)/)?.[0] || '0');
            const numB = parseInt(path.basename(b).match(/(\d+)/)?.[0] || '0');
            return numA - numB;
          });

          // Replace the simple gallery item with a structured one
          item.media[i] = {
            type: 'gallery',
            alt: mediaItem.alt,
            baseSrc: mediaItem.src, // Keep original folder path
            images: imagePaths
          };
          console.log(`    -> Populated with ${imagePaths.length} images.`);
        }
      }
    }
  }

  await fs.writeFile(absolutePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Finished processing ${filePath}.`);
}

async function main() {
  console.log('🚀 Starting media manifest generation...');
  for (const file of DATA_FILES) {
    try {
      await processDataFile(file);
    } catch (error) {
      console.error(`❌ Failed to process ${file}:`, error);
    }
  }
  console.log('🎉 Media manifest generation complete!');
}

main(); 